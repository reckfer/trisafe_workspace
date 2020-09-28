/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import Configuracao from './src/common/Configuracao';
import GerenciadorContextoApp from './src/contexts/GerenciadorContextoApp';

/// Android-only:  BackgroundFetch event-handler when app is terminated.
/// NOTE:  This handler must be placed and registered here in index.js -- DO NOT place this in your App components.
///
const headlessTask = async ({ taskId }) => {
    try {
        console.log('[trisafeapp] App.headlessTask() ++++++++++++ iniciou ++++++++++++');
        console.log('[trisafeapp] App.headlessTask() taskId =', taskId);
    
        let oConfiguracao = new Configuracao(new GerenciadorContextoApp());
        oConfiguracao.enviarLogsContingencia(taskId, true);
        
        console.log('[trisafeapp] App.headlessTask() ------------ terminou ------------');

    } catch (oExcecao) {
        let mensagem = 'Mas não foi possível identificar a causa.';
        let stack = '';

        if(oExcecao) {
            if(oExcecao.message) {
                mensagem = oExcecao.message;
            }
            if(oExcecao.message) {
                stack = oExcecao.stack;
            }
        }
        
        mensagem = `[trisafeapp] App.headlessTask() Algo deu errado ao iniciar tarefa em segundo plano. ${mensagem}`;

        console.log(`${mensagem}. Stack: ${stack}`);
    }
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(headlessTask);

AppRegistry.registerComponent(appName, () => App);
