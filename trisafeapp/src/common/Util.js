'use strict';
import { clonarObjeto, DADOS_BOTAO, DADOS_MENSAGEM_MODAL } from "../contexts/DadosAppGeral";

const NOME_COMPONENTE = 'Util';

export default class Util {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;                        
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosChaves = this.oDadosApp.chaves;
        }

        this.definirBotaoMensagem = this.definirBotaoMensagem.bind(this);
        this.exibirMensagem = this.exibirMensagem.bind(this);
        this.tratarExcecao = this.tratarExcecao.bind(this);
    }

    definirBotaoMensagem (textoBotao, oFuncaoAcao) {
        
        let oBotoesModal = this.oDadosControleApp.config_modal.botoes;
        let oBotao = clonarObjeto(DADOS_BOTAO);
        
        oBotao.texto = textoBotao;
        oBotao.funcao = oFuncaoAcao;

        oBotoesModal.push(oBotao);
    }

    exibirMensagem(textoMensagem, indAlerta, oFuncaoAlerta) {
        let nomeFuncao = 'exibirMensagem';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        if(textoMensagem && textoMensagem.trim()) {
            if(indAlerta) {

                let oBotao = clonarObjeto(DADOS_BOTAO);
            
                oBotao.texto = 'OK';
                oBotao.funcao = oFuncaoAlerta;

                this.oDadosControleApp.config_modal.botoes.push(oBotao);
            }

            this.oDadosControleApp.config_modal.mensagem = textoMensagem;
            this.oDadosControleApp.config_modal.exibir_modal = true;
        } else {
            this.oDadosControleApp.config_modal = clonarObjeto(DADOS_MENSAGEM_MODAL);    
        }
        this.oGerenciadorContextoApp.atualizarMensagemModal();
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    fecharMensagem() {
        let nomeFuncao = 'fecharMensagem';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        this.oDadosControleApp.config_modal.mensagem = '';
        this.oDadosControleApp.config_modal.exibir_modal = false;

        this.oGerenciadorContextoApp.atualizarMensagemModal();
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    tratarExcecao(oExcecao) {
        let nomeFuncao = 'tratarExcecao';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        let mensagem = 'Mas não foi possível identificar a causa.';
        let stack = 'Stack vazio.'

        if(oExcecao) {
            if(oExcecao.message) {
                mensagem = oExcecao.message;
            }
            if(oExcecao.message) {
                stack = oExcecao.stack;
            }
        }
        mensagem = `Algo deu errado. ${mensagem}`;
        this.oRegistradorLog.registrar(`${mensagem}. Stack: ${stack}`);

        this.exibirMensagem(mensagem, true);

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    tratarExcecaoLogs(oExcecao) {
        let nomeFuncao = 'tratarExcecaoLogs';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        let mensagem = 'Mas não foi possível identificar a causa.';
        let stack = 'Stack vazio.'

        if(oExcecao) {
            if(oExcecao.message) {
                mensagem = oExcecao.message;
            }
            if(oExcecao.message) {
                stack = oExcecao.stack;
            }
        }
        mensagem = `Algo deu errado ao enviar logs para o servidor. ${mensagem}`;
        this.oRegistradorLog.registrar(`${mensagem}. Stack: ${stack}`);

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
};