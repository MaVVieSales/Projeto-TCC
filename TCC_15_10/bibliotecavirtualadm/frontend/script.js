//script.js
const botao_login = document.getElementById("login")
const resultado = document.getElementById("resultado")

botao_login.addEventListener("click", async (req, res) => {
    const resposta_back_end = await fetch("http://localhost:3000/login")
    if (!resposta_back_end.ok) {
        console.log("erro")
    }
    window.location.href = "http://127.0.0.1:5500/home.html"
    
})

botao_sincronizar.addEventListener("click", async (req, res) => {
    const resposta_back_end = await fetch("http://localhost:3000/login")
    if (!resposta_back_end.ok) {
        console.log("erro")
    }

    const dados = await resposta_back_end.json()
    let HTML = ""

    for (let index = 0; index < dados.resultado.length; index++) {
        HTML += "<div class= 'class'>"
            HTML += `<img src="${dados.resultado[index].foto}" alt="" width="50px">`
            HTML += `<p>Nome: ${dados.resultado[index].nome}</p>`
            HTML += `<p>Idade: ${dados.resultado[index].idade}</p>`
            HTML += `<p>Curso: ${dados.resultado[index].curso}</p>`
        HTML += "</div>"
    }
    console.log(HTML)
    resultado.innerHTML = HTML
})

document.getElementById("procurar").addEventListener("click", async () => {
    const isbn = document.getElementById("ISBN").value.trim();
    if (!isbn) {
        alert("Digite um ISBN válido!");
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:3000/livro/isbn/${isbn}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            document.getElementById("titulo").value = dados.titulo || "";
            document.getElementById("autor").value = dados.autor || "";
            document.getElementById("editora").value = dados.editora || "";
            document.getElementById("genero").value = dados.genero || "";
            document.getElementById("capa").value = dados.capa || "";

            // Exibir a capa
            if (dados.capa) {
                const img = document.getElementById("previewCapa");
                img.src = dados.capa;
                img.style.display = "block";
            }
        } else {
            alert(dados.Mensagem || "Erro ao buscar livro.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar ao servidor.");
    }
});

window.addEventListener("DOMContentLoaded", () => {
    const btnProcurar = document.getElementById("procurar");

    if (btnProcurar) {
        btnProcurar.addEventListener("click", async () => {
            const isbn = document.getElementById("ISBN").value.trim();
            if (!isbn) {
                alert("Digite um ISBN válido!");
                return;
            }

            try {
                const resposta = await fetch(`http://localhost:3000/livro/isbn/${isbn}`);
                const dados = await resposta.json();

                if (resposta.ok) {
                    document.getElementById("titulo").value = dados.titulo || "";
                    document.getElementById("autor").value = dados.autor || "";
                    document.getElementById("editora").value = dados.editora || "";
                    document.getElementById("genero").value = dados.genero || "";
                    document.getElementById("capa").value = dados.capa || "";

                    // Exibir a capa
                    const img = document.getElementById("previewCapa");
                    if (dados.capa) {
                        img.src = dados.capa;
                        img.style.display = "block";
                    } else {
                        img.style.display = "none";
                    }
                } else {
                    alert(dados.Mensagem || "Livro não encontrado.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro ao conectar ao servidor.");
            }
        });
    }
});

