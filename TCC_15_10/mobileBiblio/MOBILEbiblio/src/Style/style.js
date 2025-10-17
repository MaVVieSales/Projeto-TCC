import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("screen");

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fundo: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 80,
    height: 956,
    flex: 1,
  },
  fundo2Wrapper: {
    width: width / 1.2,
    height: 700,
    borderRadius: 10,
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 80,
  },
  senai: {
    width: width / 2.3,
    height: 54,
    marginTop: -20,
    marginBottom: -18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    zIndex: 2,
  },
  senaiimg: {
    width: width / 2.5,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  button: {
    marginVertical: 10,
    width: width / 1.6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    width: width / 4,
    marginVertical: 40,
  },
  livro: {
    width: width / 1.6,
    height: width / 2.5,
    resizeMode: 'contain',
    marginTop: 20,
  },
  linha: {
    flexDirection: 'row',
    width: width / 1.6,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 3,
    width: width / 1.6,

  },
  input: {
    marginTop: 4,
    marginBottom: 13,
    width: width / 1.6,
  },
  input2: {
    marginTop: 24,
    marginBottom: 3,
    width: width / 1.6,
  },
  link: {
    width: width / 1.6,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  link2: {
    width: width / 1.6,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  error: {
    color: 'red',
    marginBottom: 5,
  },
});











