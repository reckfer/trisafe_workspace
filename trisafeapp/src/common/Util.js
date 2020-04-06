import {
    Alert,
} from 'react-native';

export default class Util {

    getURL(metodo){
        protocol = 'https://';
        domain = 'trisafeserverappheroku.herokuapp.com';

        if (__DEV__) {
            protocol = 'http://';
            domain = '192.168.0.5:8000';
        }
        return protocol + domain + metodo;
    }

    obterJsonResposta(oRespostaHTTP) {
        if(oRespostaHTTP) {
            if(oRespostaHTTP.ok) {            
                return oRespostaHTTP.json();            
            } else {
                Alert.alert("Erro HTTP status: " + oRespostaHTTP.status + 
                ". URL: " + oRespostaHTTP.url);
            }
        }
        return null;
    }

    tratarRetornoServidor(oJsonRetorno, oFuncaoTratarDados, suprimirMsgServidor) {
        
        if(oJsonRetorno) {
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
            Alert.alert("O retorno do servidor foi vazio.");
        }
    }
}