'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import ComunicacaoHTTP from './ComunicacaoHTTP';
import { clonarObjeto } from '../contexts/DadosAppGeral';
import {
    Alert
} from 'react-native';
import Util from './Util';

export default class Configuracao {

    constructor(gerenciadorContexto, instanciaComponente) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oDadosChaves = this.oDadosApp.chaves;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
        }
        this.oInstanciaComponente = instanciaComponente;
        
        this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);

        this.autenticarCliente = this.autenticarCliente.bind(this);
        this.apropriarToken = this.apropriarToken.bind(this);
        this.texto_instrucao = '';
    }

    autenticarCliente() {

        try {
            if(!this.oDadosChaves.token_trisafe) {
                this.texto_instrucao = this.oDadosInstrucao.texto_instrucao;
                this.oDadosInstrucao.texto_instrucao = 'Autenticando. Aguarde...';
                this.oDadosControleApp.autenticado = false;
                this.oGerenciadorContextoApp.atualizarEstadoTela(this.oInstanciaComponente);

                let metodoURI = '/autenticacoestrisafe/autenticar_cliente/';
                
                let oDadosChaves = {
                    // Clona o objeto de chaves, para não manter a credencial_secundaria (atribuida abaixo) na instancia original do objeto.
                    'chaves' : clonarObjeto(this.oDadosChaves)
                }
                // Credencial secundaria.
                oDadosChaves.chaves.credencial_secundaria = 'gAAAAABfQRrm33-jDVGFyH0c2pbFeAjh2oCjwq4xtdhMvDUES2v-9MJiBQjgbrjjQvHL468V-KT1MUDD_JEAODLS1KJaW_sNb5PZb0Xp00Ow3VknOcYnP1zlyjXbGU8IR3-jeqmDosXk-C35XkRePBrQeMwQ9jtJXQ==';

                let oDadosParametros = JSON.stringify(oDadosChaves);

                this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.apropriarToken, true, false);
            }
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    apropriarToken(oDados, oEstado) {
        this.oDadosInstrucao.texto_instrucao = 'A autenticação com o servidor falhou.';

        if(oEstado && oEstado.ok && 
            this.oDadosChaves && 
            this.oDadosChaves.token_trisafe && 
            this.oDadosChaves.token_trisafe.trim()) {
            
            this.autenticado = true;
            this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        }

        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oInstanciaComponente);
    }
}