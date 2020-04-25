import {
    Alert,
} from 'react-native';
// import GerenciadorLog from './../common/GerenciadorLog';

export default class Util {

    // constructor(oTela){
    //     this.oLogger = new GerenciadorLog(oTela);
    // }
    getURL(metodo){
        protocol = 'https://';
        domain = 'trisafeserverherokua.herokuapp.com';

        if (__DEV__) {
            protocol = 'http://';
            domain = '192.168.0.5:8000';
        }
        return protocol + domain + metodo;
    }

    obterJsonResposta(oRespostaHTTP) {
        //let this.oLogger = logger.createLogger();

        // this.oLogger.registrar('Util.obterJsonResposta() => Iniciou.');

        if(oRespostaHTTP) {

            // this.oLogger.registrar('Util.obterJsonResposta() => Recebeu: ' + JSON.stringify(oRespostaHTTP));

            if(oRespostaHTTP.ok) {
                let oJsonDados = oRespostaHTTP.json();

                // this.oLogger.registrar('Util.obterJsonResposta() => Resposta http ok. Dados: ' + JSON.stringify(oJsonDados));
                
                return oJsonDados;
            } else {
                
                // this.oLogger.registrar('Util.obterJsonResposta() => Resposta http nao ok.');

                if(oRespostaHTTP.status && oRespostaHTTP.url) {
                    
                    Alert.alert("Erro HTTP status: " + oRespostaHTTP.status + 
                    ". URL: " + oRespostaHTTP.url);
                } else if (oRespostaHTTP instanceof Error) {
                    
                    // this.oLogger.registrar(oRespostaHTTP.message);
                    Alert.alert(oRespostaHTTP.message);
                }
            }
        } else {
            // this.oLogger.registrar('Util.obterJsonResposta() => oRespostaHTTP estava vazia. Vai retornar null de obterJsonResposta().');
        }
        return null;
    }

    tratarRetornoServidor(oJsonRetorno, oFuncaoTratarDados, suprimirMsgServidor) {
        
        // this.oLogger.registrar('Util.tratarRetornoServidor() => Iniciou.');

        if(oJsonRetorno) {
            // this.oLogger.registrar('Util.tratarRetornoServidor() => Recebeu: ' + JSON.stringify(oJsonRetorno));

            let oEstado = oJsonRetorno.estado;
            let oDados = oJsonRetorno.dados;

            if (!suprimirMsgServidor && oEstado.mensagem && oEstado.mensagem.trim()){
                Alert.alert(oEstado.mensagem);
            }
            
            if(oDados && typeof(oDados) === 'string' && oDados.trim()) {
                oDados = oDados.trim();
            }
            
            oFuncaoTratarDados(oDados, oEstado);
        } else {
            // this.oLogger.registrar('Util.tratarRetornoServidor() => oJsonRetorno estava vazio.');
            
            Alert.alert("O retorno do servidor foi vazio.");
        }
    }
}