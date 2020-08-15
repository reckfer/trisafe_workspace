import {
    Alert,
} from 'react-native';

export default class Util {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oCredencial = this.oGerenciadorContextoApp.dadosApp.chaves
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;
        }
        
        this.obterJsonResposta = this.obterJsonResposta.bind(this);
        this.tratarRetornoServidor = this.tratarRetornoServidor.bind(this);
    }

    getURL(metodo){
        protocol = 'https://';
        domain = 'trisafeserverherokua.herokuapp.com';

        if (__DEV__) {
            protocol = 'http://';
            domain = '192.168.1.118:8000';
        }
        return protocol + domain + metodo;
    }
    
    obterJsonResposta(oRespostaHTTP) {

        this.oRegistradorLog.registrar('Util.obterJsonResposta() => Iniciou.');

        if(oRespostaHTTP) {

            this.oRegistradorLog.registrar('Util.obterJsonResposta() => Recebeu: ' + JSON.stringify(oRespostaHTTP));

            if(oRespostaHTTP.ok) {
                let oJsonDados = oRespostaHTTP.json();

                this.oRegistradorLog.registrar('Util.obterJsonResposta() => Resposta http ok.');
                
                return oJsonDados;
            } else {
                
                this.oRegistradorLog.registrar('Util.obterJsonResposta() => Resposta http nao ok.');

                if(oRespostaHTTP.status && oRespostaHTTP.url) {
                    
                    Alert.alert('Trisafe', "Erro HTTP status: " + oRespostaHTTP.status + 
                    ". URL: " + oRespostaHTTP.url);
                } else if (oRespostaHTTP instanceof Error) {
                    
                    this.oRegistradorLog.registrar(oRespostaHTTP.message);
                    Alert.alert('Trisafe', oRespostaHTTP.message);
                }
            }
        } else {
            this.oRegistradorLog.registrar('Util.obterJsonResposta() => oRespostaHTTP estava vazia. Vai retornar null de obterJsonResposta().');
        }
        return null;
    }

    tratarRetornoServidor(oJsonRetorno, oFuncaoTratarDados, suprimirMsgServidor, ignorarCallbackSeErro) {
        
        this.oRegistradorLog.registrar('Util.tratarRetornoServidor() => Iniciou.');

        if(oJsonRetorno) {
            this.oRegistradorLog.registrar('Util.tratarRetornoServidor() => Recebeu: ' + JSON.stringify(oJsonRetorno));

            console.log('Util.tratarRetornoServidor() oJsonRetorno => ', oJsonRetorno);
            
            let oEstado = oJsonRetorno.estado;
            let oDados = oJsonRetorno.dados;
            
            if(oJsonRetorno.credencial.token_iter) {
                this.oCredencial.token_iter = oJsonRetorno.credencial.token_iter
            }
            
            if (!suprimirMsgServidor && oEstado.mensagem && oEstado.mensagem.trim()){
                Alert.alert('Trisafe', oEstado.mensagem);
            }
            
            if(oDados && typeof(oDados) === 'string' && oDados.trim()) {
                oDados = oDados.trim();
            }
            if(ignorarCallbackSeErro) {
                if(oEstado.ok === true) {
                    oFuncaoTratarDados(oDados, oEstado);
                }
            } else {
                oFuncaoTratarDados(oDados, oEstado);
            }
        } else {
            this.oRegistradorLog.registrar('Util.tratarRetornoServidor() => oJsonRetorno estava vazio.');
            
            Alert.alert('Trisafe', "O retorno do servidor foi vazio.");
        }
    }
}