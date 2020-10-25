'use strict';
import Orientation from "react-native-orientation";
import { clonarObjeto, DADOS_BOTAO, DADOS_MENSAGEM_MODAL } from "../contexts/DadosAppGeral";
import NetInfo from "@react-native-community/netinfo";

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

    exibirMensagem(textoMensagem, indAlerta, oFuncaoAlerta, indFixarHorizontal) {
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

        if(indFixarHorizontal === undefined) {

            Orientation.getOrientation((err, orientacaoAtual) => {
            
                if(!err) {
                    this.oDadosControleApp.tela_na_horizontal = false;
                    
                    if (orientacaoAtual && orientacaoAtual.trim().toUpperCase().indexOf('LANDSCAPE') >= 0) {
                        this.oDadosControleApp.tela_na_horizontal = true;
                    }

                    this.oGerenciadorContextoApp.atualizarMensagemModal();
                } else {
                    this.tratarExcecao(err);
                }
            });
        } else {
            this.oDadosControleApp.tela_na_horizontal = indFixarHorizontal;
            
            this.oGerenciadorContextoApp.atualizarMensagemModal();
        }
        
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

        this.oRegistradorLog.transportar();
    }

    tratarErroComunicacao(oErro) {
        let nomeFuncao = 'tratarErroComunicacao';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if(oErro) {
            let mensagem = 'No momento não é possível comunicar com nossos servidores.';
            this.oRegistradorLog.registrar(JSON.stringify(oErro));

            this.fecharMensagem();

            if (oErro.name && oErro.name.trim().toUpperCase().indexOf('ABORTERROR') >= 0) {
                let mensagem = 'O tempo máximo de comunicação foi excedido.';

                if(this.oGerenciadorContextoApp.funcaoAtual) {
                    let tempoEsperaRetentativa = 30000;
                    if(__DEV__) {
                        tempoEsperaRetentativa = 5000;
                    }
                    if(this.oDadosControleApp.qtd_retentativas_comunicacao < 5) {
                        mensagem += `\n\nTentará novamente em ${tempoEsperaRetentativa/1000} segundos...`;
                        
                        this.oDadosControleApp.qtd_retentativas_comunicacao++;

                        setTimeout(this.oGerenciadorContextoApp.funcaoAtual, tempoEsperaRetentativa);
                        this.exibirMensagem(mensagem);
                    } else {
                        mensagem = 'Lamentamos a impossibilidade de atendê-lo no momento.\n\nPor favor, tente novamente mais tarde.';
                        this.exibirMensagem(mensagem, true);
                    }
                }
                return;
            }
            this.exibirMensagem(mensagem.concat('\nTente novamente mais tarde.'));

            this.oRegistradorLog.transportar();
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } else {
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        }
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

    verificarConexaoRedeAtiva(callback) {
        NetInfo.fetch().then(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);

            if(callback) {
                callback();
            }
          });
    }
};