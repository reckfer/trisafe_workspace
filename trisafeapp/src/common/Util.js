'use strict';
import { Alert } from "react-native";

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

        this.exibirMensagemUsuario = this.exibirMensagemUsuario.bind(this);
        this.tratarExcecao = this.tratarExcecao.bind(this);
    }

    exibirMensagemUsuario (mensagem, oFuncaoAlerta) {
        if (mensagem && mensagem.trim()){

            Alert.alert(
                'TriSafe',
                mensagem,
                [
                    {
                        text: 'OK',
                        style: 'default',
                        onPress: oFuncaoAlerta
                    },
                ]
            );
        }
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

        this.exibirMensagemUsuario(mensagem, () => {});

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
        mensagem = `Algo deu errado ao enviar los para o servidor. ${mensagem}`;
        this.oRegistradorLog.registrar(`${mensagem}. Stack: ${stack}`);

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
};