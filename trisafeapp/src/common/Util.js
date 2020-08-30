import { Alert } from "react-native";

export default class Util {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;                        
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosChaves = this.oDadosApp.chaves;
        }

        this.tratarExcecao = this.tratarExcecao.bind(this);
    }

    tratarExcecao(oExcecao) {
        
        this.oRegistradorLog.registrar(`Util.tratarExcecao() ${oExcecao.stack}`);

        Alert.alert('TriSafe', `Algo deu errado. ${oExcecao.message}`);
    }
}