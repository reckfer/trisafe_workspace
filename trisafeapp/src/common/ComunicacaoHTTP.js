'use strict';
import {
    Alert,
} from 'react-native';
import Util from './Util';

export default class ComunicacaoHTTP {

    constructor(gerenciadorContexto, instanciaComponente) {
        this.oComponente = instanciaComponente;

        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosChaves = this.oDadosApp.chaves;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
        }
        this.fazerRequisicaoHTTP = this.fazerRequisicaoHTTP.bind(this);
        this.fazerRequisicaoHTTPSemDadosRetorno = this.fazerRequisicaoHTTPSemDadosRetorno.bind(this);
        this.obterJsonResposta = this.obterJsonResposta.bind(this);
        this.tratarRetornoServidor = this.tratarRetornoServidor.bind(this);
    };

    getURL(metodo){
        let protocol = 'https://';
        // domain = 'trisafeserverherokua.herokuapp.com';
        let domain = 'app.trisafe.com.br';

        if (__DEV__) {
            protocol = 'http://';
            domain = '192.168.0.104:8000';
        }
        return protocol + domain + metodo;
    };

    getParametrosHTTPS(oDados) {
        let metodo = 'POST';

        if(!oDados) {
            oDados = '{}';
        }

        return {
            method: metodo,
            headers: {
                //'Authorization': 'Token 3f7edf70591040bf58437b0cc5d986972ced732e',
                'Authorization': 'Token 4e2293199e1797f16aef2c474e684ab32bd7640d',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: oDados,
        }
    };

    fazerRequisicaoHTTP(metodoURI, oDadosParametros, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro) {
        this.oDadosControleApp.processando_requisicao = true;
        
        if(this.oComponente) {
            this.oComponente.texto_instrucao = this.oDadosInstrucao.texto_instrucao;
            this.oDadosInstrucao.texto_instrucao = 'Processando. Aguarde...';
            this.oGerenciadorContextoApp.atualizarEstadoTela(this.oComponente);
        }
        
        let url = this.getURL(metodoURI);
        
        this.oRegistradorLog.registrar(`ComunicacaoHTTP.fazerRequisicaoHTTP() Realizando requisicao para ${url}, parametros = ${oDadosParametros}`);

        fetch(url, this.getParametrosHTTPS(oDadosParametros))
            .then(this.obterJsonResposta)
            .then((oJsonDados) => {
                this.tratarRetornoServidor(oJsonDados, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro);
            })
            .catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
    };

    fazerRequisicaoHTTPSemDadosRetorno(metodoURI, oDadosParametros, oFuncaoCallback, ignorarErro) {
        
        let url = this.getURL(metodoURI);
        
        this.oRegistradorLog.registrar(`ComunicacaoHTTP.fazerRequisicaoHTTPSemDadosRetorno() url = ${url}`);
        
        fetch(url, this.getParametrosHTTPS(oDadosParametros)).then((oRespostaHTTP) => { 
                this.obterJsonResposta(oRespostaHTTP, ignorarErro); 
            }).then(() => {
                    if(oFuncaoCallback) {

                        oFuncaoCallback();
                    }
                }
            ).catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
    };

    fazerRequisicaoHTTPRegistrarLogs(oFuncaoCallback) {
        
        let metodoURI = '/gerenciadorlogs/registrar_do_cliente/';
        let url = this.getURL(metodoURI);

        this.oRegistradorLog.registrar(`ComunicacaoHTTP.fazerRequisicaoHTTPRegistrarLogs() url = ${url}`);

        let oMensagensLog = {
            'registros_log' : this.oRegistradorLog.registrosLog,
        }
        let oDadosParametros = JSON.stringify(oMensagensLog);

        fetch(url, this.getParametrosHTTPS(oDadosParametros)).then((oRespostaHTTP) => { 
                this.obterJsonResposta(oRespostaHTTP, true); 
            }).then(() => {
                if(oFuncaoCallback) {
                    oFuncaoCallback();
                }
            }).catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
    };
    
    obterJsonResposta(oRespostaHTTP, ignorarErro) {

        this.oRegistradorLog.registrar(`ComunicacaoHTTP.obterJsonResposta() Resposta HTTP = ${JSON.stringify(oRespostaHTTP)}`);

        if(oRespostaHTTP) {

            if(oRespostaHTTP.ok) {
                let oJsonDados = oRespostaHTTP.json();
    
                return oJsonDados;
            } else {

                if(!ignorarErro) {
                    if(oRespostaHTTP.status && oRespostaHTTP.url) {
                        
                        Alert.alert('Trisafe', "Erro HTTP status: " + oRespostaHTTP.status + 
                        ". URL: " + oRespostaHTTP.url);
                    } else if (oRespostaHTTP instanceof Error) {
                        
                        this.oRegistradorLog.registrar(oRespostaHTTP.message);
                        Alert.alert('Trisafe', oRespostaHTTP.message);
                    }
                }
            }
        }
        return null;
    }

    tratarRetornoServidor(oJsonRetorno, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro) {
        this.oDadosControleApp.processando_requisicao = false;
            
        if(this.oComponente) {
            
            this.oDadosInstrucao.texto_instrucao = this.oComponente.texto_instrucao;
            this.oGerenciadorContextoApp.atualizarEstadoTela(this.oComponente);
        }
        
        this.oRegistradorLog.registrar('ComunicacaoHTTP.tratarRetornoServidor() => Iniciou.');

        if(oJsonRetorno) {
            this.oRegistradorLog.registrar('ComunicacaoHTTP.tratarRetornoServidor() => Recebeu: ' + JSON.stringify(oJsonRetorno));
    
            let oEstado = oJsonRetorno.estado;
            let oDados = oJsonRetorno.dados;
            
            if(oJsonRetorno.credencial.token_iter) {
                this.oDadosChaves.token_iter = oJsonRetorno.credencial.token_iter;
            }
            if(oJsonRetorno.credencial.token_trisafe) {
                this.oDadosChaves.token_trisafe = oJsonRetorno.credencial.token_trisafe;
            }
            
            if (!suprimirMsgServidor && oEstado.mensagem && oEstado.mensagem.trim()) {
                Alert.alert('Trisafe', oEstado.mensagem);
            }
            
            if(oDados && typeof(oDados) === 'string' && oDados.trim()) {
                oDados = oDados.trim();
            }

            if(oFuncaoCallback) {
             
                if(ignorarCallbackSeErro) {
                    if(oEstado.ok === true) {
                        oFuncaoCallback(oDados, oEstado);
                    }
                } else {
                    oFuncaoCallback(oDados, oEstado);
                }
            }
        } else {
            this.oRegistradorLog.registrar('ComunicacaoHTTP.tratarRetornoServidor() => oJsonRetorno estava vazio.');
            
            Alert.alert('Trisafe', "O retorno do servidor foi vazio.");
        }
    }
}