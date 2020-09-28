'use strict';
import { DADOS_LOG_GERAL } from './DadosAppLog';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Util from '../common/Util';
import AsyncStorage from '@react-native-community/async-storage';

const logRegistroInicio = `++++++++++++ iniciou ++++++++++++`;
const logRegistroFim = `------------ terminou ------------`;

export default class RegistradorLog {
    
    constructor(gerenciadorContexto) {
        this.oGerenciadorContextoApp = gerenciadorContexto;
        this.oDadosLog = DADOS_LOG_GERAL;
        this.oRegistrosLogs = this.oDadosLog.registros_log;
        this.oRegistrosLogsContingencia = this.oDadosLog.registros_log_contingencia;
        this.oGerenciadorContextoApp.registradorLog = this;
        this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
        this.oUtil = new Util(this.oGerenciadorContextoApp);

        this.registrar = this.registrar.bind(this);
        this.registrarInicio = this.registrarInicio.bind(this);
        this.registrarFim = this.registrarFim.bind(this);
        this.montarSequenciaChamadas = this.montarSequenciaChamadas.bind(this);
        this.transportar = this.transportar.bind(this);
        this.transportarLogsEmContingencia = this.transportarLogsEmContingencia.bind(this);
        this.salvarLogsEmContingencia = this.salvarLogsEmContingencia.bind(this);
        this.tratarRetornoLog = this.tratarRetornoLog.bind(this);
        this.tratarRetornoLogErro = this.tratarRetornoLogErro.bind(this);
        this.limpar = this.limpar.bind(this);
        this.enviando = false;
        this.indEnviandoEmContingencia = false;
        this.qtdTentativasEnvioContingencia = 0;
        this.chamouFim = false;
        this.nomesClassesChamadas = '';
        this.classesChamadas = [];
        this.contadoresChamadas = [];
        this.classesMetodoLog = '';
    }

    get registrosLog() {
        return this.oRegistrosLogs;
    }

    get enviandoEmContingencia() {
        return this.indEnviandoEmContingencia;
    }

    registrarInicio(nomeClasse, nomeFuncao) {
        let contador = 0;

        //if(this.classesChamadas.length == 0) {
            this.classesChamadas.push(nomeClasse);
        //     contador++;
        //     this.contadoresChamadas.push(contador);
        // } else {
        //     let indice = this.contadoresChamadas.length - 1;

        //     if(this.classesChamadas[indice] === nomeClasse) {
                
        //         contador = this.contadoresChamadas[indice];
        //         contador++;
        //         this.contadoresChamadas[indice] = contador;
        //     } else {
        //         this.classesChamadas.push(nomeClasse);
        //         contador++;
        //         this.contadoresChamadas.push(contador);
        //     }
        // }
        // let nomeUltimaClasse = this.classesChamadas[this.classesChamadas.length - 1];

        // if(nomeUltimaClasse !== nomeClasse) {
        //     this.classesChamadas.push(nomeClasse);
        // }

        this.nomesClassesChamadas = this.montarSequenciaChamadas();
        this.classesMetodoLog = `${this.nomesClassesChamadas}.${nomeFuncao}() `;

        this.chamouFim = false;

        if(__DEV__) {

            this.registrar(`${logRegistroInicio}`);
        }
    }

    registrarFim(nomeClasse, nomeFuncao) {
        //let indice = this.contadoresChamadas.length - 1;
        //let contador = this.contadoresChamadas[indice];

        // contador--;
        // this.contadoresChamadas[indice] = contador;

        // if(contador <= 0) {
        this.nomesClassesChamadas = this.montarSequenciaChamadas();
        this.classesMetodoLog = `${this.nomesClassesChamadas}.${nomeFuncao}() `;
        
        if(this.classesChamadas && this.classesChamadas.length > 0) {
            this.classesChamadas.pop();
        }
        //     this.contadoresChamadas.pop();
        // }

        // let nomeUltimaClasse = this.classesChamadas[this.classesChamadas.length - 1];

        // if(nomeUltimaClasse !== nomeClasse) {
        //     this.classesChamadas.pop();
        // }

        if(__DEV__) {
            this.registrar(`${logRegistroFim}`);
        }
        
    }

    registrar(registroLog) {
        let oDH = new Date();
        let registroDetalhado  = `${this.classesMetodoLog}${registroLog}`;

        let oMensagemLog = {
            'data_hora': oDH.toLocaleString(),
            'mensagem_log' : registroDetalhado,
        }

        if(__DEV__) {

            console.log(`[trisafeapp] ${registroDetalhado}`);
        }

        this.oRegistrosLogs.push(oMensagemLog);
    }

    montarSequenciaChamadas() {
        let ultimaClasseLida = '';
        let classeAtual;
        let sequenciaMontada = [];
        let registroSequencia = '';

        if(this.classesChamadas && this.classesChamadas.length > 0) {
            for(let i = 0; i < this.classesChamadas.length; i++) {
                
                classeAtual = this.classesChamadas[i];

                if(classeAtual !== ultimaClasseLida) {

                    sequenciaMontada.push(classeAtual);
                    ultimaClasseLida = classeAtual;
                }
            }
            registroSequencia = sequenciaMontada.join(' > ');
        }
        
        return registroSequencia;
    }

    transportar() {
        try {

            // let a = this.a.c;
            if(!this.enviando && !this.indEnviandoEmContingencia && this.oRegistrosLogs.length > 0) {
                this.enviando = true;

                this.oComunicacaoHTTP.fazerRequisicaoHTTPRegistrarLogs(this.tratarRetornoLog, this.tratarRetornoLogErro);
            }
        } catch (oExcecao) {

            this.oUtil.tratarExcecaoLogs(oExcecao);
            this.tratarRetornoLogErro();
        }
    }

    transportarLogsEmContingencia() {
        
        try {
            AsyncStorage.getItem('log_contingencia')
                .then((dadosLog) => {
                    try {
                        if(dadosLog) {
                            this.oRegistrosLogsContingencia = this.oRegistrosLogs;
                            dadosLog = JSON.parse(dadosLog);
                            this.oRegistrosLogs = dadosLog.registros_log_contingencia
                        
                            if(this.oRegistrosLogs && this.oRegistrosLogs instanceof Array) {
                                
                                if(!this.enviando && !this.indEnviandoEmContingencia && this.oRegistrosLogs.length > 0) {
                                    this.indEnviandoEmContingencia = true;
                                    
                                    let a = this.a.v;
                                    this.oComunicacaoHTTP.fazerRequisicaoHTTPRegistrarLogs(this.tratarRetornoLog, this.tratarRetornoLogErro);
                                }
                            } else {
                                this.oRegistrosLogs = this.oRegistrosLogsContingencia;
                            }
                        }
                    } catch (oExcecao) {

                        this.indEnviandoEmContingencia = true;
                        this.oUtil.tratarExcecaoLogs(oExcecao);
                        this.tratarRetornoLogErro();
                    }
                });
        } catch (oExcecao) {

            this.indEnviandoEmContingencia = true;
            this.oUtil.tratarExcecaoLogs(oExcecao);
            this.tratarRetornoLogErro();
        }
    }

    salvarLogsEmContingencia(emContingencia) {
        try {
            if(this.oRegistrosLogs && this.oRegistrosLogs.length > 0) {
                
                AsyncStorage.getItem('log_contingencia')
                    .then((dadosLog) => {
                        try {
                            let oRegistrosLogsSalvar = [];
                            
                            if(dadosLog) {
                                dadosLog = JSON.parse(dadosLog);
                                oRegistrosLogsSalvar = dadosLog.registros_log_contingencia
                                
                                if(!oRegistrosLogsSalvar || !(oRegistrosLogsSalvar instanceof Array)) {
                                    oRegistrosLogsSalvar = [];
                                }

                                this.qtdTentativasEnvioContingencia = dadosLog.qtd_tentativas;
                                
                                if(emContingencia) {
                                    this.qtdTentativasEnvioContingencia++;
                                }
                            }

                            oRegistrosLogsSalvar = oRegistrosLogsSalvar.concat(this.oRegistrosLogs);
                            
                            dadosLog = {
                                qtd_tentativas: this.qtdTentativasEnvioContingencia,
                                registros_log_contingencia: oRegistrosLogsSalvar
                            }
                            AsyncStorage.setItem('log_contingencia', JSON.stringify(dadosLog))
                                .then((resultado) => {
                                    // Limpa os registros.
                                    this.limpar();
                                })
                        } catch (oExcecao) {

                            this.indEnviandoEmContingencia = true;
                            this.oUtil.tratarExcecaoLogs(oExcecao);
                        }
                    });
            }
        } catch (oExcecao) {

            this.indEnviandoEmContingencia = true;
            this.oUtil.tratarExcecaoLogs(oExcecao);
        }
    }

    limpar() {
        if(this.oRegistrosLogs) {
            this.oRegistrosLogs.length = 0;
        }
    }

    limparContingencia() {
        try {
            AsyncStorage.removeItem('log_contingencia');
            this.indEnviandoEmContingencia = false;
            this.qtdTentativasEnvioContingencia = 0;
        } catch (oExcecao) {

            this.indEnviandoEmContingencia = true;
            this.oUtil.tratarExcecaoLogs(oExcecao);
        }
    }

    tratarRetornoLog() {

        if(this.indEnviandoEmContingencia) {
            this.oRegistrosLogs = this.oRegistrosLogsContingencia;
            this.limparContingencia();
        } else {
            this.transportarLogsEmContingencia();
        }
        this.enviando = false;
        this.indEnviandoEmContingencia = false;

        this.limpar();
    }

    tratarRetornoLogErro() {
        if(this.indEnviandoEmContingencia) {
            this.oRegistrosLogs = this.oRegistrosLogsContingencia;
            
            if(this.qtdTentativasEnvioContingencia > 20) {
                // Limpa, se excedeu o limite de tentativas.
                this.limparContingencia();
            }
        }
        this.salvarLogsEmContingencia(this.indEnviandoEmContingencia);
        this.enviando = false;
        this.indEnviandoEmContingencia = false;
    }
}