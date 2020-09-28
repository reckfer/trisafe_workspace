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
    PermissionsAndroid
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Util from './Util';
import BackgroundFetch from 'react-native-background-fetch';

export default class Configuracao {

    constructor(gerenciadorContexto, instanciaComponente) {
        
        if(gerenciadorContexto) {
            gerenciadorContexto.criarAtalhosDadosContexto(this);

            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp);
        }
        this.oInstanciaComponente = instanciaComponente;

        this.autenticarCliente = this.autenticarCliente.bind(this);
        this.apropriarToken = this.apropriarToken.bind(this);
        this.solicitarPermissaoArmazenamento = this.solicitarPermissaoArmazenamento.bind(this);
        this.solicitarPermissaoNumeroTelefone = this.solicitarPermissaoNumeroTelefone.bind(this);
        this.enviarLogsContingencia = this.enviarLogsContingencia.bind(this);
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

                this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.apropriarToken, false, false);
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

    configurarRotinaDeSegundoPlano() {

        BackgroundFetch.configure({
            minimumFetchInterval: 15,      // <-- minutes (15 is minimum allowed)
            // Android options
            forceAlarmManager: false,      // <-- Set true to bypass JobScheduler.
            stopOnTerminate: false,
            enableHeadless: true,
            startOnBoot: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
            requiresCharging: false,       // Default
            requiresDeviceIdle: false,     // Default
            requiresBatteryNotLow: false,  // Default
            requiresStorageNotLow: false,  // Default
        }
        , 
        onBackgroundFetchEvent, 
        (status) => {
            this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
            console.log('[despertadorapp] componentDidMount() [BackgroundFetch] status ', statusToString(status), status);
        }
        );
    }
    solicitarPermissaoArmazenamento(callback) {
        try {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Salvar arquivos no dispositivo.',
              message: 'O aplicativo da Trisafe necessita salvar o contrato no seu dispositivo após baixá-lo.\nVocê autoriza?',
              buttonNegative: "Não",
              buttonPositive: "Sim"
            }
          )
          .then((granted) => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Acesso ao armazenamento autorizado.");
                    
                    if(callback) {
                        callback();
                    }
                } else {
                    console.log("Acesso ao armazenamento negado.");
                }
            })
            .catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        } catch (err) {
          console.warn(err);
        }
    }

    solicitarPermissaoNumeroTelefone() {
        try {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: 'Acesso ao número do telefone.',
              message: 'O aplicativo da Trisafe necessita obter o número do seu telefone.\nVocê autoriza?',
              buttonNegative: "Não",
              buttonPositive: "Sim"
            }
          )
          .then((granted) => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    
                    DeviceInfo.getPhoneNumber()
                    .then((numTelefone) => {
                    
                        this.oDadosApp.cliente.telefone = numTelefone;
                        this.oRegistradorLog.registrar(`Numero telefone: ${numTelefone}`);
                    }).catch((oExcecao) => {
                        this.oUtil.tratarExcecao(oExcecao);
                    });
                } else {
                    this.oRegistradorLog.registrar(`Acesso ao número do telefone negado.`);
                }
            })
            .catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        } catch (err) {
          console.warn(err);
        }
    }

    enviarLogsContingencia(taskId, indEmSegundoPlano) {
        this.oRegistradorLog.transportarLogsEmContingencia();
    }
}

export function inicializarContextoComum(propsGeral, contextoGeral, oComponente, textoInstrucao) {

    if(propsGeral && propsGeral.navigation) {
        oComponente.oNavegacao = propsGeral.navigation;
    }
    
    if(contextoGeral && contextoGeral.gerenciador) {
        // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
        let oGerenciador = contextoGeral.gerenciador;
        
        oGerenciador.criarAtalhosDadosContexto(oComponente);

        if(textoInstrucao) {
            oComponente.texto_instrucao = textoInstrucao;
            oComponente.oDadosInstrucao.texto_instrucao = textoInstrucao;
        }

        oComponente.oComunicacaoHTTP = new ComunicacaoHTTP(oGerenciador, this);
        if(!(oComponente instanceof Configuracao)) {
            oComponente.oConfiguracao = new Configuracao(oGerenciador, this);
        }
        oComponente.oUtil = new Util(oGerenciador);
    }
}

/// Execute a BackgroundFetch.scheduleTask
///
export const scheduleTask = async (name) => {
    try {
      await BackgroundFetch.scheduleTask({
        taskId: name,
        stopOnTerminate: false,
        enableHeadless: true,
        delay: 5000,               // milliseconds (5s)
        forceAlarmManager: true,   // more precise timing with AlarmManager vs default JobScheduler
        periodic: false            // Fire once only.
      });
    } catch (e) {
      console.warn('[BackgroundFetch] scheduleTask falhou.', e);
    }
  }

/// BackgroundFetch event-handler.
/// All events from the plugin arrive here, including #scheduleTask events.
///
const onBackgroundFetchEvent = async (taskId) => {
    console.log('[despertadorapp] onBackgroundFetchEvent() ++++++++++++ iniciou ++++++++++++');
    console.log('[despertadorapp] onBackgroundFetchEvent() taskId = ', taskId);

    if (taskId === 'react-native-background-fetch') {
        // Test initiating a #scheduleTask when the periodic fetch event is received.
        try {
            await scheduleTask('com.transistorsoft.customtask');
        } catch (e) {
            console.warn('[BackgroundFetch] scheduleTask falied', e);
        }
    }
    // Required: Signal completion of your task to native code
    // If you fail to do this, the OS can terminate your app
    // or assign battery-blame for consuming too much background-time
    BackgroundFetch.finish(taskId);
    console.log('[despertadorapp] onBackgroundFetchEvent() ------------ terminou ------------');
};

/// Render BackgroundFetchStatus to text.
export const statusToString = (status) => {
    switch(status) {
      case BackgroundFetch.STATUS_RESTRICTED:
        console.info('[BackgroundFetch] status: restricted');
        return 'restricted';
      case BackgroundFetch.STATUS_DENIED:
        console.info('[BackgroundFetch] status: denied');
        return 'denied';
      case BackgroundFetch.STATUS_AVAILABLE:
        console.info('[BackgroundFetch] status: enabled');
        return 'available';
    }
    return 'unknown';
  };