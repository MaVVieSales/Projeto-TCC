const dotenv = require('dotenv')
dotenv.config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require('fs');
const multer = require('multer');

const app = express();
// Usa as variáveis do .env
const PORT = process.env.PORT;
const HOST = process.env.HOST;

//diretório
app.use(express.json());
app.use(cors());
// Serve a pasta "front"


// Conexão com banco de dados com .env
const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



// --- ROTAS EXISTENTES ---
app.get("/", (req, res) => res.send("Rota padrão"));

app.get("/config.js", (req, res) => {
    res.type("application/javascript");
    res.send(`window.API_URL = "http://${process.env.HOST}:${process.env.PORT}";`);
});
app.use(express.static(path.join(__dirname, "../front")));

app.get("/hash", (req, res) => {
    const { senha } = req.query;
    const hash_gerada = crypto.createHash("sha256").update(senha).digest("hex");
    res.send(hash_gerada);
});

// Adicione após as outras rotas GET
app.get("/api-config", (req, res) => {
    res.json({
        apiUrl: `http://${process.env.HOST}:${process.env.PORT}`,
        host: process.env.HOST,
        port: process.env.PORT
    });
});

app.post("/cadastrar", async (req, res) => {
    try {
        const { nome, email, senhaAdm } = req.body;
        if (!nome || !email || !senhaAdm)
            return res.status(400).json({ Mensagem: "Todos os campos são obrigatórios!" });

        const [rows] = await conexao.execute("SELECT * FROM administrador WHERE email = ?", [email]);
        if (rows.length > 0) return res.status(400).json({ Mensagem: "Já existe um usuário com esse email!" });

        const hash_gerada = crypto.createHash("sha256").update(senhaAdm).digest("hex");
        const sql = `INSERT INTO administrador (nome, email, senhaAdm) VALUES (?, ?, ?)`;
        await conexao.execute(sql, [nome, email, hash_gerada]);

        res.json({ Mensagem: "Cadastro realizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, senhaAdm } = req.body;

        if (!email || !senhaAdm || email.trim() === "" || senhaAdm.trim() === "") {
            return res.status(400).json({ Mensagem: "Login e senha não podem estar vazios!" });
        }

        const hash_gerada = crypto.createHash("sha256").update(senhaAdm).digest("hex");

        const sql = `SELECT id, nome, email, foto FROM administrador WHERE email = ? AND senhaAdm = ? LIMIT 1`;
        const [rows] = await conexao.query(sql, [email, hash_gerada]);

        if (rows.length === 0) {
            return res.status(401).json({ Mensagem: "Usuário ou senha inválidos!" });
        }

        // Retorna dados completos do usuário
        res.json({
            Mensagem: "Login realizado com sucesso!",
            usuario: {
                id: rows[0].id,
                nome: rows[0].nome,
                email: rows[0].email,
                foto: rows[0].foto
            }
        });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

// --- LIVROS MANUAL ---
app.post("/cadastrarLivro", async (req, res) => {
    try {
        const { titulo, editora, autor, genero, capa, quantidade_total, quantidade_disponivel } = req.body;

        if (!titulo || !editora || !autor || !genero || !capa || quantidade_total == null || quantidade_disponivel == null)
            return res.json({ Mensagem: "Todos os campos devem ser preenchidos!" });

        const sql = `INSERT INTO livros (titulo, editora, autor, genero, capa, quantidade_total, quantidade_disponivel) 
                     VALUES (?,?,?,?,?,?,?)`;

        await conexao.execute(sql, [titulo, editora, autor, genero, capa, quantidade_total, quantidade_disponivel]);
        res.json({ Mensagem: "Livro Registrado!" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.get("/listarLivros", async (req, res) => {
    try {
        const sql = `SELECT * FROM livros`;
        const [livros] = await conexao.execute(sql);
        if (livros.length === 0) return res.status(404).json({ Mensagem: "Nenhum livro encontrado!" });
        res.json({ Livros: livros });
    } catch (error) {
        console.error("Erro ao listar livros:", error);
        res.status(500).json({ Mensagem: "Erro interno do servidor" });
    }
});

app.delete("/livros/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = "DELETE FROM livros WHERE id = ?";
        const [result] = await conexao.execute(sql, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ Mensagem: "Livro não encontrado!" });
        res.status(200).json({ Mensagem: "Livro removido com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir livro:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.get("/livros/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = "SELECT * FROM livros WHERE id = ?";
        const [rows] = await conexao.execute(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ Mensagem: "Livro não encontrado!" });
        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar livro:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.put("/livros/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, editora, autor, genero, capa, quantidade_total, quantidade_disponivel } = req.body;
    try {
        const sql = "UPDATE livros SET titulo = ?, editora = ?, autor = ?, genero = ?, capa = ?, quantidade_total = ?, quantidade_disponivel = ? WHERE id = ?";
        const [result] = await conexao.execute(sql, [titulo, editora, autor, genero, capa, quantidade_total, quantidade_disponivel, id]);
        if (result.affectedRows === 0) return res.status(404).json({ Mensagem: "Livro não encontrado!" });
        res.status(200).json({ Mensagem: "Livro atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar livro:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.post("/cadastrarTCC", async (req, res) => {
    try {
        const { titulo, ano, curso, autor, link } = req.body;
        if (!titulo || !ano || !curso || !autor || !link) {
            return res.status(400).json({ Mensagem: "Todos os campos devem ser preenchidos!" });
        }

        const sql = `INSERT INTO tccs (titulo, ano, curso, autor, link) VALUES (?, ?, ?, ?, ?)`;
        await conexao.execute(sql, [titulo, ano, curso, autor, link]);

        res.status(201).json({ Mensagem: "TCC Registrado!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.get("/listarTCCs", async (req, res) => {
    try {
        const sql = `SELECT * FROM tccs`;
        const [tcc] = await conexao.execute(sql);
        if (tcc.length === 0) return res.status(404).json({ Mensagem: "Nenhum TCC encontrado!" });
        res.json({ tcc: tcc });
    } catch (error) {
        console.error("Erro ao listar TCCs:", error);
        res.status(500).json({ Mensagem: "Erro interno do servidor" });
    }
});

app.delete("/TCCs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = "DELETE FROM tccs WHERE id = ?";
        const [result] = await conexao.execute(sql, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ Mensagem: "TCC não encontrado!" });
        res.status(200).json({ Mensagem: "TCC removido com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir TCC:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.get("/TCCs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = "SELECT * FROM tccs WHERE id = ?";
        const [rows] = await conexao.execute(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ Mensagem: "TCC não encontrado!" });
        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar TCC:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

app.put("/TCCs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, ano, curso, link } = req.body;
    try {
        const sql = "UPDATE tccs SET titulo = ?, ano = ?, curso = ?, link = ? WHERE id = ?";
        const [result] = await conexao.execute(sql, [titulo, ano, curso, link, id]);
        if (result.affectedRows === 0) return res.status(404).json({ Mensagem: "TCC não encontrado!" });
        res.status(200).json({ Mensagem: "TCC atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar TCC:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor" });
    }
});

async function scrapeGoogleBook(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        // Espera a tabela carregar
        await page.waitForSelector("#metadata_content_table", { timeout: 5000 });

        const dados = await page.evaluate(() => {
            const resultado = {};

            // Título exato da página
            const tituloPagina = document.querySelector("h1[itemprop='name']")?.innerText.trim();
            resultado.Título = tituloPagina || "Sem título";

            // Tabela de informações
            const tabela = document.querySelector("#metadata_content_table");
            if (tabela) {
                const linhas = tabela.querySelectorAll("tr.metadata_row");
                linhas.forEach(linha => {
                    const label = linha.querySelector(".metadata_label")?.innerText.trim();
                    const valor = linha.querySelector(".metadata_value")?.innerText.trim();
                    if (label && valor) resultado[label] = valor;
                });
            }

            // Capa: tenta pegar exatamente como estava antes
            const imgEl = document.querySelector("#summary-frontcover img") || document.querySelector("#summary-frontcover");
            resultado.capa = imgEl ? imgEl.src || imgEl.getAttribute("src") : null;

            return resultado;
        });

        await browser.close();
        return dados;

    } catch (err) {
        await browser.close();
        console.error("Erro scraping:", err);
        return null;
    }
}

app.get("/livro/isbn/:isbn", async (req, res) => {
    const { isbn } = req.params;

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();

        if (!data.items || data.items.length === 0)
            return res.status(404).json({ Mensagem: "Livro não encontrado via Google Books API." });

        const item = data.items[0];
        const infoLink = item.volumeInfo.infoLink;

        const detalhes = await scrapeGoogleBook(infoLink);

        res.json({
            titulo: detalhes?.Título || item.volumeInfo.title || "",
            autor: detalhes?.Autor || (item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : ""),
            editora: detalhes?.Editora || item.volumeInfo.publisher || "",
            genero: detalhes?.Gênero || (item.volumeInfo.categories ? item.volumeInfo.categories.join(", ") : ""),
            capa: detalhes?.capa || (item.volumeInfo.imageLinks?.thumbnail || ""),
            link: infoLink
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ Mensagem: "Erro ao buscar livro pelo ISBN." });
    }
});



// ============================================
// ROTAS PARA GERENCIAMENTO DE RESERVAS (ADMIN)
// ============================================

// --- Listar todas as pré-reservas (aguardando + retiradas + devolvidas) ---
app.get("/pre_reservas", async (req, res) => {
    try {
        const sql = `
            SELECT 
                pr.id,
                pr.usuario_id,
                pr.livro_id,
                pr.data_reserva,
                pr.status,
                pr.data_retirada,
                pr.data_retirada_max,
                pr.data_devolucao,
                l.titulo,
                l.capa,
                l.autor,
                l.editora,
                u.nome AS nome_usuario,
                u.matricula
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            ORDER BY 
                CASE pr.status
                    WHEN 'aguardando' THEN 1
                    WHEN 'retirado' THEN 2
                    WHEN 'devolvido' THEN 3
                    ELSE 4
                END,
                pr.data_reserva DESC
        `;
        const [reservas] = await conexao.execute(sql);
        res.json(reservas);
    } catch (err) {
        console.error("Erro ao listar pré-reservas:", err);
        res.status(500).json({ erro: "Erro interno ao listar pré-reservas." });
    }
});

// --- Listar apenas pré-reservas aguardando ---
app.get("/pre_reservas/aguardando", async (req, res) => {
    try {
        const sql = `
            SELECT 
                pr.id,
                pr.usuario_id,
                pr.livro_id,
                pr.data_reserva,
                pr.data_retirada_max,
                pr.status,
                l.titulo,
                l.capa,
                l.autor,
                u.nome AS nome_usuario,
                u.matricula
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.status = 'aguardando'
            ORDER BY pr.data_reserva ASC
        `;
        const [reservas] = await conexao.execute(sql);
        res.json(reservas);
    } catch (err) {
        console.error("Erro ao listar pré-reservas aguardando:", err);
        res.status(500).json({ erro: "Erro interno ao listar pré-reservas." });
    }
});

// --- Listar apenas livros retirados ---
app.get("/pre_reservas/retirados", async (req, res) => {
    try {
        const sql = `
            SELECT 
                pr.id,
                pr.usuario_id,
                pr.livro_id,
                pr.data_reserva,
                pr.data_retirada,
                pr.data_retirada_max,
                pr.status,
                l.titulo,
                l.capa,
                l.autor,
                u.nome AS nome_usuario,
                u.matricula
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.status = 'retirado'
            ORDER BY pr.data_retirada DESC
        `;
        const [reservas] = await conexao.execute(sql);
        res.json(reservas);
    } catch (err) {
        console.error("Erro ao listar livros retirados:", err);
        res.status(500).json({ erro: "Erro interno ao listar livros retirados." });
    }
});

// --- Listar histórico completo (retirados + devolvidos) ---
app.get("/pre_reservas/historico", async (req, res) => {
    try {
        const sql = `
            SELECT 
                pr.id,
                pr.usuario_id,
                pr.livro_id,
                pr.data_reserva,
                pr.data_retirada,
                pr.data_devolucao,
                pr.status,
                l.titulo,
                l.capa,
                l.autor,
                u.nome AS nome_usuario,
                u.matricula
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.status IN ('retirado', 'devolvido', 'cancelada')
            ORDER BY 
                CASE 
                    WHEN pr.data_devolucao IS NOT NULL THEN pr.data_devolucao
                    WHEN pr.data_retirada IS NOT NULL THEN pr.data_retirada
                    ELSE pr.data_reserva
                END DESC
        `;
        const [historico] = await conexao.execute(sql);
        res.json(historico);
    } catch (err) {
        console.error("Erro ao listar histórico:", err);
        res.status(500).json({ erro: "Erro interno ao listar histórico." });
    }
});

// --- Buscar uma pré-reserva específica por ID ---
app.get("/pre_reservas/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SELECT 
                pr.*,
                l.titulo,
                l.capa,
                l.autor,
                l.editora,
                l.quantidade_disponivel,
                u.nome AS nome_usuario,
                u.matricula,
                u.email
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.id = ?
        `;
        const [rows] = await conexao.execute(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Erro ao buscar pré-reserva:", err);
        res.status(500).json({ erro: "Erro interno ao buscar pré-reserva." });
    }
});

// --- Registrar retirada do livro ---
app.put("/pre_reservas/:id/retirar", async (req, res) => {
    const { id } = req.params;
    const { data_retirada } = req.body; // Data/hora opcional (manual ou automática)

    try {
        // Busca a reserva atual
        const [reserva] = await conexao.execute(
            "SELECT * FROM pre_reservas WHERE id = ? AND status = 'aguardando'",
            [id]
        );

        if (reserva.length === 0) {
            return res.status(404).json({ erro: "Reserva não encontrada ou já foi processada." });
        }

        // Define a data de retirada (manual ou automática)
        const dataRetirada = data_retirada || new Date().toISOString();

        // Calcula data máxima para devolução (7 dias após a retirada)
        const dataRetiradaMax = new Date(dataRetirada);
        dataRetiradaMax.setDate(dataRetiradaMax.getDate() + 7);

        // Atualiza o status para 'retirado'
        const sql = `
            UPDATE pre_reservas
            SET 
                status = 'retirado',
                data_retirada = ?,
                data_retirada_max = ?
            WHERE id = ?
        `;

        await conexao.execute(sql, [
            dataRetirada,
            dataRetiradaMax.toISOString(),
            id
        ]);

        res.json({
            mensagem: "Retirada registrada com sucesso!",
            data_retirada: dataRetirada,
            data_retirada_max: dataRetiradaMax.toISOString()
        });

    } catch (err) {
        console.error("Erro ao registrar retirada:", err);
        res.status(500).json({ erro: "Erro interno ao registrar retirada." });
    }
});

// --- Registrar devolução do livro ---
// --- Registrar devolução do livro (CORRIGIDO) ---
app.put("/pre_reservas/:id/devolver", async (req, res) => {
    const { id } = req.params;
    const { data_devolucao, disponibilizar } = req.body;
    // data_devolucao: opcional (manual ou automática)
    // disponibilizar: boolean (true = incrementa quantidade disponível)

    try {
        // 1. Busca a reserva atual com dados do livro
        const [reserva] = await conexao.execute(
            `SELECT 
                pr.*, 
                l.quantidade_disponivel, 
                l.quantidade_total 
             FROM pre_reservas pr
             JOIN livros l ON pr.livro_id = l.id
             WHERE pr.id = ? AND pr.status = 'retirado'`,
            [id]
        );

        if (reserva.length === 0) {
            return res.status(404).json({
                erro: "Reserva não encontrada ou ainda não foi retirada."
            });
        }

        const reservaAtual = reserva[0];
        const dataDevolucao = data_devolucao || new Date().toISOString();

        // 2. Atualiza o status para 'devolvido'
        const sqlReserva = `
            UPDATE pre_reservas
            SET 
                status = 'devolvido',
                data_devolucao = ?
            WHERE id = ?
        `;

        await conexao.execute(sqlReserva, [dataDevolucao, id]);

        // 3. Se solicitado, atualiza a quantidade disponível do livro
        if (disponibilizar === true) {
            const novaQuantidade = (reservaAtual.quantidade_disponivel || 0) + 1;

            // Garante que não ultrapasse o total
            const quantidadeFinal = Math.min(
                novaQuantidade,
                reservaAtual.quantidade_total || novaQuantidade
            );

            const sqlLivro = `
                UPDATE livros
                SET quantidade_disponivel = ?
                WHERE id = ?
            `;

            await conexao.execute(sqlLivro, [
                quantidadeFinal,
                reservaAtual.livro_id
            ]);

            return res.json({
                mensagem: "Devolução registrada e livro disponibilizado com sucesso!",
                data_devolucao: dataDevolucao,
                quantidade_disponivel: quantidadeFinal,
                livro_id: reservaAtual.livro_id
            });
        } else {
            return res.json({
                mensagem: "Devolução registrada com sucesso! Livro não foi disponibilizado.",
                data_devolucao: dataDevolucao
            });
        }

    } catch (err) {
        console.error("Erro ao registrar devolução:", err);
        return res.status(500).json({
            erro: "Erro interno ao registrar devolução.",
            detalhes: err.message
        });
    }
});

// ============================================
// ROTAS DE DIAGNÓSTICO (para debug)
// ============================================

// --- Verificar dados de uma reserva específica ---
app.get("/debug/reserva/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SELECT 
                pr.id as reserva_id,
                pr.usuario_id,
                pr.livro_id,
                pr.status,
                pr.data_reserva,
                pr.data_retirada,
                pr.data_devolucao,
                l.id as livro_id_tabela,
                l.titulo,
                l.quantidade_disponivel,
                l.quantidade_total,
                u.nome as usuario_nome,
                u.matricula
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.id = ?
        `;

        const [result] = await conexao.execute(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({ erro: "Reserva não encontrada" });
        }

        res.json({
            debug: true,
            reserva: result[0],
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Erro no diagnóstico:", err);
        res.status(500).json({
            erro: "Erro ao buscar dados",
            detalhes: err.message
        });
    }

});

// --- Verificar estrutura da tabela livros ---
app.get("/debug/estrutura/livros", async (req, res) => {
    try {
        const [columns] = await conexao.execute(
            "DESCRIBE livros"
        );

        res.json({
            debug: true,
            colunas: columns,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Erro ao verificar estrutura:", err);
        res.status(500).json({
            erro: "Erro ao verificar estrutura",
            detalhes: err.message
        });
    }
});

// --- Verificar um livro específico ---
app.get("/debug/livro/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await conexao.execute(
            "SELECT * FROM livros WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado" });
        }

        res.json({
            debug: true,
            livro: result[0],
            campos: Object.keys(result[0]),
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Erro ao buscar livro:", err);
        res.status(500).json({
            erro: "Erro ao buscar livro",
            detalhes: err.message
        });
    }
});

// --- Atualizar pré-reserva (rota genérica para edições) ---
app.put("/pre_reservas/:id", async (req, res) => {
    const { id } = req.params;
    const { status, data_retirada, data_devolucao } = req.body;

    try {
        const updates = [];
        const values = [];

        if (status) {
            updates.push("status = ?");
            values.push(status);
        }

        if (data_retirada) {
            updates.push("data_retirada = ?");
            values.push(data_retirada);
        }

        if (data_devolucao) {
            updates.push("data_devolucao = ?");
            values.push(data_devolucao);
        }

        if (updates.length === 0) {
            return res.status(400).json({ erro: "Nenhum campo para atualizar." });
        }

        values.push(id);

        const sql = `UPDATE pre_reservas SET ${updates.join(", ")} WHERE id = ?`;
        const [result] = await conexao.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        res.json({ mensagem: "Reserva atualizada com sucesso!" });

    } catch (err) {
        console.error("Erro ao atualizar pré-reserva:", err);
        res.status(500).json({ erro: "Erro interno ao atualizar pré-reserva." });
    }
});

// --- Buscar pré-reservas por usuário (para o app mobile) ---
app.get("/pre_reservas/usuario/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const sql = `
            SELECT 
                pr.*,
                l.titulo,
                l.capa,
                l.autor,
                l.editora
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            WHERE pr.usuario_id = ?
            ORDER BY 
                CASE pr.status
                    WHEN 'aguardando' THEN 1
                    WHEN 'retirado' THEN 2
                    WHEN 'devolvido' THEN 3
                    ELSE 4
                END,
                pr.data_reserva DESC
        `;

        const [reservas] = await conexao.execute(sql, [usuario_id]);
        res.json(reservas);

    } catch (err) {
        console.error("Erro ao buscar reservas do usuário:", err);
        res.status(500).json({ erro: "Erro interno ao buscar reservas do usuário." });
    }
});

// --- Estatísticas de reservas (para dashboard) ---
app.get("/pre_reservas/stats/geral", async (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(CASE WHEN status = 'aguardando' THEN 1 END) as total_aguardando,
                COUNT(CASE WHEN status = 'retirado' THEN 1 END) as total_retirados,
                COUNT(CASE WHEN status = 'devolvido' THEN 1 END) as total_devolvidos,
                COUNT(CASE WHEN status = 'devolvido' AND DATE(data_devolucao) = CURDATE() THEN 1 END) as devolvidos_hoje
            FROM pre_reservas
        `;

        const [stats] = await conexao.execute(sql);
        res.json(stats[0]);

    } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        res.status(500).json({ erro: "Erro interno ao buscar estatísticas." });
    }
});

// --- Deletar/Cancelar pré-reserva ---
app.delete("/pre_reservas/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se existe
        const [reserva] = await conexao.execute(
            "SELECT * FROM pre_reservas WHERE id = ?",
            [id]
        );

        if (reserva.length === 0) {
            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        // Se preferir apenas cancelar ao invés de deletar:
        const sql = `
            UPDATE pre_reservas
            SET status = 'cancelada', data_devolucao = NOW()
            WHERE id = ?
        `;

        // Ou se quiser deletar de vez:
        // const sql = "DELETE FROM pre_reservas WHERE id = ?";

        await conexao.execute(sql, [id]);

        res.json({ mensagem: "Reserva cancelada com sucesso!" });

    } catch (err) {
        console.error("Erro ao cancelar reserva:", err);
        res.status(500).json({ erro: "Erro interno ao cancelar reserva." });
    }
});

// --- CONFIGURAÇÃO DO MULTER PARA UPLOAD DE FOTOS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'fotos');

        // Cria a pasta se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.params.id;
        const ext = path.extname(file.originalname);
        const filename = `adm_${userId}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// --- SERVIR ARQUIVOS ESTÁTICOS DA PASTA UPLOADS ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- BUSCAR DADOS DO ADMINISTRADOR POR ID ---
app.get("/administrador/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ Mensagem: "ID é obrigatório." });
        }

        const [rows] = await conexao.execute(
            "SELECT id, nome, email, foto FROM administrador WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ Mensagem: "Administrador não encontrado." });
        }

        const admin = rows[0];

        // Se não tiver foto, retorna o caminho da imagem padrão
        if (!admin.foto) {
            admin.foto = '/uploads/usericon.png';
        }

        res.json(admin);
    } catch (error) {
        console.error("Erro ao buscar administrador:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor." });
    }
});

// --- ATUALIZAR DADOS DO ADMINISTRADOR (com validação de senha) ---
// --- ATUALIZAR DADOS DO ADMINISTRADOR ---
app.put("/administrador/:id", upload.single("foto"), async (req, res) => {
    const { id } = req.params;
    const { nome, email, senhaAtual } = req.body;

    try {
        if (!senhaAtual) {
            return res
                .status(400)
                .json({ Mensagem: "Senha atual é obrigatória para realizar alterações." });
        }

        // Buscar senha atual do banco
        const [adminRows] = await conexao.execute(
            "SELECT senhaAdm, foto FROM administrador WHERE id = ?",
            [id]
        );

        if (adminRows.length === 0) {
            return res.status(404).json({ Mensagem: "Administrador não encontrado." });
        }

        const senhaBanco = adminRows[0].senhaAdm;

        // Gerar hash SHA-256 da senha informada
        const hashSenhaAtual = crypto.createHash("sha256").update(senhaAtual).digest("hex");

        // Comparar hashes
        if (hashSenhaAtual !== senhaBanco) {
            return res.status(401).json({ Mensagem: "Senha atual incorreta." });
        }

        // Montar SQL de atualização
        const updates = [];
        const values = [];

        if (nome && nome.trim() !== "") {
            updates.push("nome = ?");
            values.push(nome.trim());
        }

        if (email && email.trim() !== "") {
            updates.push("email = ?");
            values.push(email.trim());
        }

        // Caso tenha enviado nova foto
        if (req.file) {
            const novaFoto = `/uploads/fotos/${req.file.filename}`;
            updates.push("foto = ?");
            values.push(novaFoto);

            // Remover foto antiga (se não for o ícone padrão)
            const fotoAntiga = adminRows[0].foto;
            if (fotoAntiga && fotoAntiga !== "/uploads/usericon.png") {
                const caminhoAntigo = path.join(__dirname, fotoAntiga);
                if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
            }
        }
        // Verificar e excluir a foto antiga
        if (fotoAntiga && fotoAntiga !== iconePadrao) {
            const caminhoAntigo = path.join(__dirname, fotoAntiga);
            if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
        }

        // Verificar e excluir o ícone padrão, se necessário
        if (fotoAntiga === iconePadrao) {
            const caminhoIconePadrao = path.join(__dirname, iconePadrao);
            if (fs.existsSync(caminhoIconePadrao)) fs.unlinkSync(caminhoIconePadrao);
        }

        // 🔒 Atualizar senha, se o campo "novaSenha" vier no body
        if (req.body.novaSenha) {
            const hashNova = crypto.createHash("sha256").update(req.body.novaSenha).digest("hex");
            await conexao.execute("UPDATE administrador SET senhaAdm = ? WHERE id = ?", [hashNova, id]);
        }

        // Verificar se há algo a atualizar além da senha
        if (updates.length === 0 && !req.body.novaSenha) {
            return res.status(400).json({ Mensagem: "Nenhum campo para atualizar." });
        }

        if (updates.length > 0) {
            values.push(id);
            const sql = `UPDATE administrador SET ${updates.join(", ")} WHERE id = ?`;
            await conexao.execute(sql, values);
        }

        const [updatedRows] = await conexao.execute(
            "SELECT id, nome, email, foto FROM administrador WHERE id = ?",
            [id]
        );

        res.json({
            Mensagem: "Dados atualizados com sucesso!",
            dados: updatedRows[0],
        });

    } catch (error) {
        console.error("Erro ao atualizar administrador:", error);

        // Se houve erro e uma nova foto foi enviada, removê-la
        if (req.file) {
            const filePath = path.join(__dirname, "uploads", "fotos", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.status(500).json({ Mensagem: "Erro interno no servidor: " + error.message });
    }
});

// --- ALTERAR SENHA DO ADMINISTRADOR ---
app.put("/administrador/:id/senha", async (req, res) => {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    try {
        if (!senhaAtual || !novaSenha) {
            return res
                .status(400)
                .json({ Mensagem: "Senha atual e nova senha são obrigatórias." });
        }

        if (novaSenha.length < 6) {
            return res
                .status(400)
                .json({ Mensagem: "A nova senha deve ter no mínimo 6 caracteres." });
        }

        // Buscar senha atual
        const [rows] = await conexao.execute(
            "SELECT senhaAdm FROM administrador WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ Mensagem: "Administrador não encontrado." });
        }

        const senhaBanco = rows[0].senhaAdm;
        const hashSenhaAtual = crypto.createHash("sha256").update(senhaAtual).digest("hex");

        // Comparar hashes
        if (hashSenhaAtual !== senhaBanco) {
            return res.status(401).json({ Mensagem: "Senha atual incorreta." });
        }

        // Gerar novo hash SHA-256
        const novaSenhaHash = crypto.createHash("sha256").update(novaSenha).digest("hex");

        await conexao.execute("UPDATE administrador SET senhaAdm = ? WHERE id = ?", [
            novaSenhaHash,
            id,
        ]);

        res.json({ Mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor." });
    }
});

// --- REMOVER FOTO DO PERFIL ---
app.delete("/administrador/:id/foto", async (req, res) => {
    const { id } = req.params;
    const { senhaAtual } = req.body;

    try {
        if (!senhaAtual) {
            return res.status(400).json({ Mensagem: "Senha atual é obrigatória." });
        }

        // Verificar senha
        const [adminRows] = await conexao.execute(
            "SELECT senha, foto FROM administrador WHERE id = ?",
            [id]
        );

        if (adminRows.length === 0) {
            return res.status(404).json({ Mensagem: "Administrador não encontrado." });
        }

        const senhaValida = await crypto.createHash("sha256").compare(senhaAtual, adminRows[0].senha);

        if (!senhaValida) {
            return res.status(401).json({ Mensagem: "Senha atual incorreta." });
        }

        // Remover arquivo físico
        if (adminRows[0].foto && adminRows[0].foto !== '/uploads/usericon.png') {
            const fotoPath = path.join(__dirname, adminRows[0].foto);
            if (fs.existsSync(fotoPath)) {
                fs.unlinkSync(fotoPath);
            }
        }

        // Atualizar banco para NULL
        await conexao.execute(
            "UPDATE administrador SET foto = NULL WHERE id = ?",
            [id]
        );

        res.json({ Mensagem: "Foto removida com sucesso!" });

    } catch (error) {
        console.error("Erro ao remover foto:", error);
        res.status(500).json({ Mensagem: "Erro interno no servidor." });
    }
});

module.exports = app;

// --- INICIA SERVIDOR ---
app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
// ============================================
// ENDPOINTS PARA GRÁFICOS DE GÊNEROS
// ============================================

// --- 1. Gêneros mais reservados ---
app.get("/estatisticas/generos-reservados", async (req, res) => {
    try {
        const sql = `
            SELECT 
                l.genero,
                COUNT(pr.id) as total_reservas
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            WHERE l.genero IS NOT NULL AND l.genero != ''
            GROUP BY l.genero
            ORDER BY total_reservas DESC
            LIMIT 10
        `;

        const [resultados] = await conexao.execute(sql);

        if (resultados.length === 0) {
            return res.json([]);
        }

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao buscar gêneros reservados:", error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas de reservas" });
    }
});

// --- 2. Gêneros mais bem avaliados ---
app.get("/estatisticas/generos-avaliados", async (req, res) => {
    try {
        const sql = `
            SELECT 
                l.genero,
                AVG(a.estrelas) as media_estrelas,
                COUNT(a.id) as total_avaliacoes
            FROM avaliacoes a
            JOIN livros l ON a.livro_id = l.id
            WHERE l.genero IS NOT NULL AND l.genero != ''
            GROUP BY l.genero
            HAVING total_avaliacoes >= 3
            ORDER BY media_estrelas DESC, total_avaliacoes DESC
            LIMIT 10
        `;

        const [resultados] = await conexao.execute(sql);

        if (resultados.length === 0) {
            return res.json([]);
        }

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao buscar gêneros avaliados:", error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas de avaliações" });
    }
});

// --- 3. Gêneros mais favoritados ---
app.get("/estatisticas/generos-favoritos", async (req, res) => {
    try {
        const sql = `
            SELECT 
                l.genero,
                COUNT(f.id) as total_favoritos
            FROM favoritos f
            JOIN livros l ON f.livro_id = l.id
            WHERE l.genero IS NOT NULL AND l.genero != ''
            GROUP BY l.genero
            ORDER BY total_favoritos DESC
            LIMIT 10
        `;

        const [resultados] = await conexao.execute(sql);

        if (resultados.length === 0) {
            return res.json([]);
        }

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao buscar gêneros favoritos:", error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas de favoritos" });
    }
});

// --- Endpoint consolidado (opcional - retorna todos os dados de uma vez) ---
app.get("/estatisticas/generos-todos", async (req, res) => {
    try {
        // Gêneros reservados
        const [reservados] = await conexao.execute(`
            SELECT l.genero, COUNT(pr.id) as total_reservas
            FROM pre_reservas pr
            JOIN livros l ON pr.livro_id = l.id
            WHERE l.genero IS NOT NULL AND l.genero != ''
            GROUP BY l.genero
            ORDER BY total_reservas DESC
            LIMIT 10
        `);

        // Gêneros mais bem avaliados (NOVO - CORRIGIDO)
        router.get('/generos-avaliados', async (req, res) => {
            try {
                const query = `
        SELECT 
          l.genero AS genero,
          ROUND(AVG(media_livro), 2) AS media_estrelas
        FROM (
          SELECT 
            a.livro_id,
            AVG(a.estrelas) AS media_livro
          FROM avaliacoes a
          GROUP BY a.livro_id
        ) AS medias
        JOIN livros l ON l.id = medias.livro_id
        WHERE l.genero IS NOT NULL AND l.genero != ''
        GROUP BY l.genero
        HAVING AVG(media_livro) > 0
        ORDER BY media_estrelas DESC
        LIMIT 10
      `;

                const [results] = await db.query(query);
                res.json(results);
            } catch (error) {
                console.error('Erro ao buscar gêneros avaliados:', error);
                res.status(500).json({ error: 'Erro ao buscar estatísticas' });
            }
        });

        // Gêneros favoritos
        const [favoritos] = await conexao.execute(`
            SELECT l.genero, COUNT(f.id) as total_favoritos
            FROM favoritos f
            JOIN livros l ON f.livro_id = l.id
            WHERE l.genero IS NOT NULL AND l.genero != ''
            GROUP BY l.genero
            ORDER BY total_favoritos DESC
            LIMIT 10
        `);

        res.json({
            reservados: reservados,
            avaliados: avaliados,
            favoritos: favoritos
        });

    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas" });
    }
});