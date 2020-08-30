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

    constructor(gerenciadorContexto, oNavegacao) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosChaves = this.oDadosApp.chaves;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
        }
        this.oNavegacao = oNavegacao;
        
        this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);

        this.configurarCredenciais = this.configurarCredenciais.bind(this);
        this.apropriarToken = this.apropriarToken.bind(this);
    }
    
    // salvarChaves(callback) {

    //     this.oRegistradorLog.registrar('[trisafeapp] salvarChaves() ++++++++++++ iniciou ++++++++++++');
        
    //     try {
    //         AsyncStorage.setItem('chaves', JSON.stringify(this.oDadosChaves))
    //         .then(() => {
            
    //             if(callback) {
    //                 callback();
    //             };
    //         });

    //     } catch (error) {
            
    //         Alert.alert('TriSafe', `Erro ao salvar dados de segurança do app no dispositivo. Contate a administração da Trisafe. Detalhes do erro: ${error}`);
    //     }
        
    //     this.oRegistradorLog.registrar('[trisafeapp] salvarChaves() ------------ terminou ------------');
    // }

    // obterChaves (callback) {
    //     this.oRegistradorLog.registrar('[trisafeapp] obterChaves() ++++++++++++ iniciou ++++++++++++');

    //     try {
    //         AsyncStorage.getItem('chaves').then((valor) => {
    //             console.log('[trisafeapp] obterChaves() valor =', valor);
                
    //             if(valor) {
    //                 this.oDadosChaves = JSON.parse(valor);
    //             } else {
    //                 callback();
    //             }
    //         });

    //     } catch (error) {

    //         Alert.alert('TriSafe', `Erro ao ler dados de segurança do app no dispositivo. Contate a administração da Trisafe. Detalhes do erro: ${error}`);
    //     }

    //     this.oRegistradorLog.registrar('[trisafeapp] obterChaves() ------------ terminou ------------');
    // }

    configurarCredenciais() {

        try {
            if(!this.oDadosChaves.token_trisafe) {
                
                this.oDadosControleApp.autenticado = false;
                let metodoHTTP = '/configuracoes/configurar_credenciais/';
                
                let oDadosChaves = {
                    // Clona o objeto de chaves, para não manter a credencial_secundaria (atribuida abaixo) na instancia original do objeto.
                    'chaves' : clonarObjeto(this.oDadosChaves)
                }
                // Credencial secundaria.
                oDadosChaves.chaves.credencial_secundaria = 'gAAAAABfQRrm33-jDVGFyH0c2pbFeAjh2oCjwq4xtdhMvDUES2v-9MJiBQjgbrjjQvHL468V-KT1MUDD_JEAODLS1KJaW_sNb5PZb0Xp00Ow3VknOcYnP1zlyjXbGU8IR3-jeqmDosXk-C35XkRePBrQeMwQ9jtJXQ==';

                let oDadosParametros = JSON.stringify(oDadosChaves);

                this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoHTTP, oDadosParametros, this.apropriarToken, true, true);
            }
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    apropriarToken(oDados) {
        
        if(oDados && oDados.token_trisafe && oDados.token_trisafe.trim()) {
            
            this.oDadosChaves.token_trisafe = oDados.token_trisafe;
            this.autenticado = true;
        }
    }
}