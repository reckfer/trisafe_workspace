'use strict';
import { DADOS_LOG_GERAL } from './DadosAppLog';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import Util from '../common/Util';

export default class RegistradorLog {
    
    constructor(gerenciadorContexto) {
        this.oGerenciadorContextoApp = gerenciadorContexto;
        this.oDadosLog = DADOS_LOG_GERAL;
        this.oRegistrosLogs = this.oDadosLog.registros_log;
        this.oGerenciadorContextoApp.registradorLog = this;
        this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
        this.oUtil = new Util(this.oGerenciadorContextoApp);

        this.registrar = this.registrar.bind(this);
        this.transportar = this.transportar.bind(this);
        this.tratarRetornoLog = this.tratarRetornoLog.bind(this);
        this.limpar = this.limpar.bind(this);
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
        
        console.log(`[trisafeapp] ${registroLog}`);

        this.oRegistrosLogs.push(oMensagemLog);
    }

    transportar() {
        try {
            console.log(`${this.enviando} ${this.oRegistrosLogs.length}`);
            if(!this.enviando && this.oRegistrosLogs.length > 0) {
                this.enviando = true;

                this.oComunicacaoHTTP.fazerRequisicaoHTTPRegistrarLogs(this.tratarRetornoLog);
            }
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
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