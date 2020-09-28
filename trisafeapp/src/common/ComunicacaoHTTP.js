'use strict';
import {
    Alert,
} from 'react-native';
import { clonarObjeto, ESTADO } from '../contexts/DadosAppGeral';
import Util from './Util';

const NOME_COMPONENTE = 'ComunicacaoHTTP';

export default class ComunicacaoHTTP {

    constructor(gerenciadorContexto, instanciaComponente) {
        this.oComponente = instanciaComponente;

        if(gerenciadorContexto) {
            gerenciadorContexto.criarAtalhosDadosContexto(this);
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
                // Antigo desnvolvimenti --- 'Authorization': 'Token 4e2293199e1797f16aef2c474e684ab32bd7640d',
                'Authorization': 'Token 7dd815215f55d8a01d66cbdb0a1bb895aba598c5',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: oDados,
        }
    };

    fazerRequisicaoHTTP(metodoURI, oDadosParametros, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro) {
        let nomeFuncao = 'fazerRequisicaoHTTP';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        this.oDadosControleApp.processando_requisicao = true;
        
        if(this.oComponente) {
            this.oComponente.texto_instrucao = this.oDadosInstrucao.texto_instrucao;
            this.oDadosInstrucao.texto_instrucao = 'Processando. Aguarde...';
            this.oGerenciadorContextoApp.atualizarEstadoTela(this.oComponente);
        }
        
        let url = this.getURL(metodoURI);
        
        this.oRegistradorLog.registrar(`Realizando requisicao para ${url}, parametros = ${oDadosParametros}`);

        fetch(url, this.getParametrosHTTPS(oDadosParametros))
            .then(this.obterJsonResposta)
            .then((oJsonDados) => {
                this.tratarRetornoServidor(oJsonDados, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro);
            })
            .catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    };

    fazerRequisicaoHTTPSemDadosRetorno(metodoURI, oDadosParametros, oFuncaoCallback, ignorarErro) {
        let nomeFuncao = 'fazerRequisicaoHTTPSemDadosRetorno';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        let url = this.getURL(metodoURI);
        
        this.oRegistradorLog.registrar(`url = ${url}`);
        
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
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    };

    fazerRequisicaoHTTPRegistrarLogs(oFuncaoCallback, oFuncaoCallbackErro) {
        try {
        let semErros = false;
        
        let metodoURI = '/gerenciadorlogs/registrar_do_cliente/';
        let url = this.getURL(metodoURI);
        let oRegistrosLog = this.oRegistradorLog.registrosLog;

        if(this.oRegistradorLog.enviandoEmContingencia) {
            let oDH = new Date();
        
            let oMensagemLog = {
                'data_hora': oDH.toLocaleString(),
                'mensagem_log' : '*********** LOGS EM CONTINGENCIA POR ERRO DE ENVIO ANTERIOR [INICIO] ***********',
            }
            oRegistrosLog = [];
            oRegistrosLog.push(oMensagemLog);
            oRegistrosLog = oRegistrosLog.concat(this.oRegistradorLog.registrosLog);
            oMensagemLog = {
                'data_hora': oDH.toLocaleString(),
                'mensagem_log' : '*********** LOGS EM CONTINGENCIA POR ERRO DE ENVIO ANTERIOR [FIM] ***********',
            }
            oRegistrosLog.push(oMensagemLog);
        }

        let oMensagensLog = {
            'registros_log' : oRegistrosLog,
        }
        let oDadosParametros = JSON.stringify(oMensagensLog);
        //let a = this.b.c;
        fetch(url, this.getParametrosHTTPS(oDadosParametros)).then((oRespostaHTTP) => { 
            
                return this.obterJsonResposta(oRespostaHTTP, true);
            }).then((oJsonRetorno) => {

                if(oJsonRetorno) {
                    let oEstado = oJsonRetorno.estado;

                    if(oEstado && oEstado.ok) {
                        semErros = true;
                    }
                }
                
            }).catch((oExcecao) => {

                this.oUtil.tratarExcecaoLogs(oExcecao);

            }).finally(() => {

                if(semErros) {
                    if(oFuncaoCallback) {
                        oFuncaoCallback();
                    }
                } else {
                    if(oFuncaoCallbackErro) {
                        oFuncaoCallbackErro();
                    }
                }
            });
        } catch (oExcecao) {

            this.oUtil.tratarExcecaoLogs(oExcecao);
            if(oFuncaoCallbackErro) {
                oFuncaoCallbackErro();
            }
        }
    }
    
    obterJsonResposta(oRespostaHTTP, ignorarErro) {
        let nomeFuncao = 'obterJsonResposta';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        this.oRegistradorLog.registrar(`Resposta HTTP = ${JSON.stringify(oRespostaHTTP)}`);
        
        let retornoJson = null;
        if(oRespostaHTTP) {

            if(oRespostaHTTP.ok) {
                let oJsonDados = oRespostaHTTP.json();
    
                retornoJson = oJsonDados;
            } else {

                if(!ignorarErro) {
                    if(oRespostaHTTP.status && oRespostaHTTP.url) {
                        
                        this.oRegistradorLog.registrar(`Erro HTTP status: ${oRespostaHTTP.status}. URL chamada:  ${oRespostaHTTP.url}`);
                    } else if (oRespostaHTTP instanceof Error) {
                        
                        this.oUtil.tratarExcecao(oRespostaHTTP);
                    }
                }
            }
        }

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);

        return retornoJson;
    }

    tratarRetornoServidor(oJsonRetorno, oFuncaoCallback, suprimirMsgServidor, ignorarCallbackSeErro) {
        let nomeFuncao = 'tratarRetornoServidor';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        let oEstado = clonarObjeto(ESTADO);
        let oDados = {};

        this.oDadosControleApp.processando_requisicao = false;
            
        if(this.oComponente) {
            
            this.oDadosInstrucao.texto_instrucao = this.oComponente.texto_instrucao;
            this.oGerenciadorContextoApp.atualizarEstadoTela(this.oComponente);
        }
        
        if(oJsonRetorno) {
            
            oEstado = oJsonRetorno.estado;
            oDados = oJsonRetorno.dados;

            if(oJsonRetorno.credencial.token_iter) {
                this.oDadosChaves.token_iter = oJsonRetorno.credencial.token_iter;
            }
            if(oJsonRetorno.credencial.token_trisafe) {
                this.oDadosChaves.token_trisafe = oJsonRetorno.credencial.token_trisafe;
            }
        } else {
            this.oRegistradorLog.registrar(`O servidor não retornou dados.`);
        }

        if (!suprimirMsgServidor && oEstado.mensagem && oEstado.mensagem.trim()) {
            Alert.alert('Trisafe', oEstado.mensagem);
        }
        
        if(oDados && typeof(oDados) === 'string' && oDados.trim()) {
            oDados = oDados.trim();
        }
        
        this.oRegistradorLog.registrar(`Estado da resposta do servidor = ${JSON.stringify(oEstado)}`);

        if(oFuncaoCallback) {
             
            if(ignorarCallbackSeErro) {
                if(oEstado.ok === true) {
                    oFuncaoCallback(oDados, oEstado);
                }
            } else {
                oFuncaoCallback(oDados, oEstado);
            }
        }
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);        
    }
}