import {
    Alert,
    AppState
} from 'react-native';

export const oEstruturaRegistroLog = {
    'registro_log':  {
        'data_hora': '',
        'mensagem_log' : '',
    }
}

export const oEstruturaDadosLog = {
    'config_log': {},
    'registros_log': [oEstruturaRegistroLog],
}

export default class GerenciadorLog {
    oDadosReferencia = oEstruturaDadosLog;
    oRegistrosLogs = oEstruturaDadosLog.registros_log;
    oTelaReferencia;
    oNavegador;
    oConfigLog;
    enviando = false;
    
    constructor(oTela) {
        this.registrar = this.registrar.bind(this);
        this.transportar = this.transportar.bind(this);
        this.obterJsonResposta = this.obterJsonResposta.bind(this);
        this.registrarTransporte = this.registrarTransporte.bind(this);
        
        if(oTela) {
            this.oTelaReferencia = oTela;
            
            if(oTela.props) {
                this.oNavegador = oTela.props.navigation;
            }
            this.inicializarDados();
        }

        AppState.addEventListener('change', this.registrarTransporte);
    }

    inicializarDados() {
        if(this.oNavegador) {

            if(this.oNavegador.getParam) {
                
                // Este trecho nao pode ser testado, pois foi alterado depois que mudou pro navegador versao 5.
                this.oDadosReferencia.dados_log = this.oNavegador.getParam('dados_log');
            } else if (this.oTelaReferencia.props.route && 
                      this.oTelaReferencia.props.route.params &&
                      this.oTelaReferencia.props.route.params.dados_log) {
                
                this.oDadosReferencia.dados_log = this.oTelaReferencia.props.route.params.dados_log;
            }
            if(!this.temLogs()) {
                // Inicializa o objeto de array de logs compartilhados.
                this.oRegistrosLogs.length = 1;
            }
        }

        return this.oDadosReferencia;
    }

    registrar(registroLog) {
        let oDH = new Date();
        let oMensagemLog = {
            'data_hora': oDH.toLocaleString(),
            'registro_log' : registroLog,
        }
        this.oRegistrosLogs.push(oMensagemLog);
    }

    temLogs() {
        // if(this.oDadosReferencia &&
        //    this.oDadosReferencia.dados_log instanceof Array &&
        //    this.oDadosReferencia.dados_log.length > 0) {
        if(this.oRegistrosLogs.length > 0) {
            let oRegistroLog = this.oRegistrosLogs[0];
            if(oRegistroLog && oRegistroLog.data_hora) {
                return true;
            }
        }
        return false;
    }

    transportar() {
        try {
            if(!this.enviando && this.oRegistrosLogs && this.oRegistrosLogs.length > 0) {
                this.enviando = true;

                let url = oUtil.getURL('/gerenciadorlogs/registrar_do_cliente/');
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
            Alert.alert(exc);
        }
    };

    obterJsonResposta(oRespostaHTTP) {
        this.enviando = false;
        this.oRegistrosLogs.length = 0;

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
    }

    registrarTransporte() {

        if (AppState.currentState.match(/inactive|background/)) {
            this.transportar();
        }
    }
}