/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util, { clonarObjeto } from '../common/Util';
import {
    Alert
} from 'react-native';
//import AsyncStorage from '@react-native-community/async-storage';
export default class Configuracao {

    constructor(gerenciadorContexto, oNavegacao) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosChaves = this.oDadosApp.chaves;
        }
        this.oNavegacao = oNavegacao;
        
        this.oUtil = new Util(this.oGerenciadorContextoApp);
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
                let url = this.oUtil.getURL('/configuracoes/configurar_credenciais/');
                
                let oDadosChaves = {
                    'chaves' : clonarObjeto(this.oDadosChaves)
                }
                // Credencial secundaria.
                oDadosChaves.chaves.credencial_secundaria = 'gAAAAABfQRrm33-jDVGFyH0c2pbFeAjh2oCjwq4xtdhMvDUES2v-9MJiBQjgbrjjQvHL468V-KT1MUDD_JEAODLS1KJaW_sNb5PZb0Xp00Ow3VknOcYnP1zlyjXbGU8IR3-jeqmDosXk-C35XkRePBrQeMwQ9jtJXQ==';

                let dadosParametros = JSON.stringify(oDadosChaves);
                
                fetch(url, this.oUtil.getParametrosHTTPS(dadosParametros))
                    .then(this.oUtil.obterJsonResposta)
                    .then((oJsonDados) => {
                        this.oUtil.tratarRetornoServidor(oJsonDados, null, true);
                    });
            }
        } catch (exc) {
            Alert.alert('Trisafe', exc);
        }
    }
}