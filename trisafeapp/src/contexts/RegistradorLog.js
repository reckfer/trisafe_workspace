'use strict';
import { DADOS_LOG_GERAL } from './DadosAppLog';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Util from '../common/Util';

const logRegistroInicio = `++++++++++++ iniciou ++++++++++++`;
const logRegistroFim = `------------ terminou ------------`;

export default class RegistradorLog {
    
    constructor(gerenciadorContexto) {
        this.oGerenciadorContextoApp = gerenciadorContexto;
        this.oDadosLog = DADOS_LOG_GERAL;
        this.oRegistrosLogs = this.oDadosLog.registros_log;
        this.oGerenciadorContextoApp.registradorLog = this;
        this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
        this.oUtil = new Util(this.oGerenciadorContextoApp);

        this.registrar = this.registrar.bind(this);
        this.registrarInicio = this.registrarInicio.bind(this);
        this.registrarFim = this.registrarFim.bind(this);
        this.montarSequenciaChamadas = this.montarSequenciaChamadas.bind(this);
        this.transportar = this.transportar.bind(this);
        this.tratarRetornoLog = this.tratarRetornoLog.bind(this);
        this.limpar = this.limpar.bind(this);
        this.enviando = false;
        this.chamouFim = false;
        this.nomesClassesChamadas = '';
        this.classesChamadas = [];
        this.contadoresChamadas = [];
        this.classesMetodoLog = '';
    }

    get registrosLog() {
        return this.oRegistrosLogs;
    }

    set nomeClasse(nomeClasse) {
        this.nomeClasseAtual = nomeClasse;
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
        let indice = this.contadoresChamadas.length - 1;
        let contador = this.contadoresChamadas[indice];

        // contador--;
        // this.contadoresChamadas[indice] = contador;

        // if(contador <= 0) {
            this.nomesClassesChamadas = this.montarSequenciaChamadas();
            this.classesMetodoLog = `${this.nomesClassesChamadas}.${nomeFuncao}() `;
            this.classesChamadas.pop();
            console.log('qtd = ', this.classesChamadas.length);
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

        for(let i = 0; i < this.classesChamadas.length; i++) {
            
            classeAtual = this.classesChamadas[i];

            if(classeAtual !== ultimaClasseLida) {

                sequenciaMontada.push(classeAtual);
                ultimaClasseLida = classeAtual;
            }
        }
        return sequenciaMontada.join(' > ');
    }
    
    transportar() {
        try {
            
            if(!this.enviando && this.oRegistrosLogs.length > 0) {
                this.enviando = true;

                this.oComunicacaoHTTP.fazerRequisicaoHTTPRegistrarLogs(this.tratarRetornoLog);
            }
        } catch (oExcecao) {
            this.oUtil.tratarExcecaoLogs(oExcecao);
        }
    };

    limpar() {
        this.oRegistrosLogs.length = 0;
    }

    tratarRetornoLog() {
        this.enviando = false;
        this.limpar();
    }
}