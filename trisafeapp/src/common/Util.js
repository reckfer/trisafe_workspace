import { Alert } from "react-native";

export default class Util {

    constructor(gerenciadorContexto, oNavegacao) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosChaves = this.oDadosApp.chaves;
        }
        this.oNavegacao = oNavegacao;

        this.tratarExcecao = this.tratarExcecao.bind(this);
    }

    tratarExcecao(oExcecao) {
        Alert.alert('TriSafe', `Infelizmente algo deu errado: ${oExcecao.message}`);
    }
}