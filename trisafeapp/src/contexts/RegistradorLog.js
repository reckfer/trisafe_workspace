import { DADOS_LOG_GERAL } from './DadosAppLog';
import {
    Alert
} from 'react-native';
import Util from '../common/Util';

export default class RegistradorLog {
    
    constructor() {
        this.oDadosLog = DADOS_LOG_GERAL;
        this.oRegistrosLogs = this.oDadosLog.registros_log;
        this.oUtil = new Util();

        this.registrar = this.registrar.bind(this);
        this.transportar = this.transportar.bind(this);
        this.obterJsonResposta = this.obterJsonResposta.bind(this);
        this.enviando = false;
    }

    get registrosLog() {
        return this.oRegistrosLogs;
    }

    registrar(registroLog) {
        let oDH = new Date();
        let oMensagemLog = {
            'data_hora': oDH.toLocaleString(),
            'mensagem_log' : registroLog,
        }
        this.oRegistrosLogs.push(oMensagemLog);
    }

    temLogs() {

        if(this.oRegistrosLogs.length > 1) {
            let oRegistroLog = this.oRegistrosLogs[1];
            if(oRegistroLog && oRegistroLog.data_hora) {
                return true;
            }
        }
        return false;
    }

    transportar() {
        try {
            if(!this.enviando && this.oRegistrosLogs.length > 1) {
                this.enviando = true;

                let url = this.oUtil.getURL('/gerenciadorlogs/registrar_do_cliente/');
                let oMensagensLog = {
                    'registros_log' : this.oRegistrosLogs,
                }
                
                fetch(url, {
                        method: 'POST',
                        headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(oMensagensLog)
                    })
                    .then(this.obterJsonResposta)
            }
        } catch (exc) {
            console.log(exc);
            Alert.alert(exc);
        }
    };

    obterJsonResposta(oRespostaHTTP) {
        this.enviando = false;
        this.oRegistrosLogs.length = 1;

        if(oRespostaHTTP) {

            if(!oRespostaHTTP.ok) {

                if(oRespostaHTTP.status && oRespostaHTTP.url) {
                    
                    Alert.alert("Erro HTTP status: " + oRespostaHTTP.status + 
                    ". URL: " + oRespostaHTTP.url);
                } else if (oRespostaHTTP instanceof Error) {
                    
                    Alert.alert(oRespostaHTTP.message);
                }
            }
        }
        return null;
    };
}