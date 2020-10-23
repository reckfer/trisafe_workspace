'use strict';
import { DADOS_APP_GERAL, clonarObjeto } from './DadosAppGeral';
import RegistradorLog from './RegistradorLog';
import DeviceInfo from 'react-native-device-info';
import { AppState } from 'react-native';
import { Component } from 'react';

const NOME_COMPONENTE = 'GerenciadorContextoApp';

export default class GerenciadorContextoApp {
    
    constructor() {
        this.oDadosReferencia = DADOS_APP_GERAL;

        this.oRegistradorLog = new RegistradorLog(this);
        
        this.criarAtalhosDadosContexto = this.criarAtalhosDadosContexto.bind(this);
        this.atualizarEstadoTela = this.atualizarEstadoTela.bind(this);
        this.atribuirDados = this.atribuirDados.bind(this);
        this.temDados = this.temDados.bind(this);
        this.coletarInformacoesDispositivo = this.coletarInformacoesDispositivo.bind(this);
        this._atribuirDadosObjeto = this._atribuirDadosObjeto.bind(this);
        this._atribuir = this._atribuir.bind(this);
        this._transportarLogServidor = this._transportarLogServidor.bind(this);
        this.oTelaAtual = null;
        this.oTelaAnterior = null;

        AppState.addEventListener('change', this._transportarLogServidor);
        this.coletarInformacoesDispositivo();
    };

    get dadosApp() {
        if(this.oDadosReferencia) {
            return this.oDadosReferencia.dados_app;
        }
        return null;
    };

    get dadosControleApp() {
        return this.oDadosReferencia.dados_app.controle_app;
    };

    get dadosAppGeral() {
        return this.oDadosReferencia;
    };
    
    get instrucaoUsuarioApp() {
        return this.oDadosReferencia.dados_app.instrucao_usuario;
    };

    get dadosDispositivo() {
        return this.oDadosReferencia.dados_app.dados_dispositivo;
    };

    get registradorLog() {
        return this.oRegistradorLog;
    }

    set registradorLog(oRegistradorLog) {
        this.oRegistradorLog = oRegistradorLog;
    }
    
    set componenteMensagemModal(oComponente) {
        this.oComponenteMensagemModal = oComponente;
    };

    get appAtivo() {

        if (AppState.currentState.match(/inactive|background/)) {
            return false;
        }

        return true;
    }
    
    set telaAtual(oTela) {
        this.oTelaAnterior = this.oTelaAtual;
        this.oTelaAtual = oTela;
    }

    get telaAnterior() {
        return this.oTelaAnterior;
    }

    criarAtalhosDadosContexto(oComponente) {
        if(oComponente) {
            
            if(oComponente instanceof Component) {
                this.telaAtual = oComponente;
            }
            
            oComponente.oGerenciadorContextoApp = this;
            oComponente.oRegistradorLog = this.registradorLog;         
            oComponente.oDadosApp = this.dadosApp;
            oComponente.oDadosControleApp = this.dadosControleApp;
            oComponente.oDadosInstrucao = this.instrucaoUsuarioApp;
            oComponente.oDadosCliente = this.dadosApp.cliente;
            oComponente.oDadosVeiculoAtual = this.dadosApp.veiculo_atual;
            oComponente.oDadosVeiculos = this.dadosApp.veiculos;
            oComponente.oDadosContrato = this.dadosApp.contrato;
            oComponente.oDadosFoto = this.dadosApp.foto;
            oComponente.oDadosChaves = this.dadosApp.chaves;
            oComponente.oDadosDispositivo = this.dadosApp.dados_dispositivo;
            
            oComponente.state = this.dadosAppGeral;
        }
    }

    /*** FUNCOES DE ATRIBUICOES ****/
    atualizarEstadoTela(objetoTela) {
        let oTela = objetoTela;
        
        if(!oTela) {
           oTela = this.oTelaAtual; 
        }

        if(oTela && this.oDadosReferencia) {
            oTela.setState(this.oDadosReferencia);
        }
    };

    atualizarMensagemModal() {
        let nomeFuncao = 'atualizarMensagemModal';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if(this.oComponenteMensagemModal) {
            this.oRegistradorLog.registrar('Atualizando mensagem modal...');
            this.oComponenteMensagemModal.setState(this.oDadosReferencia);
        }
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    atribuirDados(nomeAtributo, oDadosAtribuir, instanciaComponente) {
        let nomeFuncao = 'atribuirDados';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        let oDados = this.oDadosReferencia.dados_app;
        let oArrayDados;
        let oItemArray;
        let oDadosItemModelo;
        let oDadosItem;
        let oArrayAtribuir;
        let campo;
        let pilhaObjetosContinuar = [];
        let oObjetoPreencher = oDados;
        let oCampoPreencher;
        let camposPreencher;
        let tentarPreencher = false;
        
        this.oRegistradorLog.limpar();
        this.oRegistradorLog.registrar(`Vai atribuir ${nomeAtributo}: ${JSON.stringify(oDadosAtribuir)}`);
        
        if(oDadosAtribuir) {
            if(oDadosAtribuir instanceof Array) {
                if(oDadosAtribuir.length > 0) {
                    tentarPreencher = true;
                }
            } else if(oDadosAtribuir instanceof Object) {
                let camposDados = Object.keys(oDadosAtribuir);

                if(camposDados && camposDados.length > 0) {
                    tentarPreencher = true;
                }
            }
        }
        
        if(!tentarPreencher){
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
            return this.oDadosReferencia;
        }

        if(nomeAtributo) {
            oObjetoPreencher = oDados[nomeAtributo];

            if(oObjetoPreencher instanceof Array) {
                let arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oObjetoPreencher;
                oObjetoPreencher = arrayEmpacotado;

                arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oDadosAtribuir;
                oDadosAtribuir = arrayEmpacotado;
            }
        }
        camposPreencher = Object.keys(oObjetoPreencher);

        for (let i = 0; i < camposPreencher.length; i ++) {
            campo = camposPreencher[i];
            
            if(!(campo in oDadosAtribuir)) {
                continue;
            }
            
            oCampoPreencher = oObjetoPreencher[campo];

            if(oCampoPreencher instanceof Array) {
                if(oCampoPreencher.length > 0) {
                    oArrayDados = oObjetoPreencher[campo];
                    oItemArray = oArrayDados[0];
                    oDadosItemModelo = {};
                    oArrayAtribuir = oDadosAtribuir[campo];                        
                    //campoItem = Object.keys(oItemArray)[0];                    
                    oDadosItemModelo = clonarObjeto(oItemArray);//this._clonarObjeto(oItemArray);
                    oArrayDados.length = 0;
                    
                    for(let i = 0; i < oArrayAtribuir.length; i++) {
                        oDadosItem = {};
                        for(let campoNovo in oDadosItemModelo) {
                            oDadosItem[campoNovo] = '';
                        }
                        
                        this._atribuirDadosObjeto(oDadosItem, oArrayAtribuir[i]);
                        oArrayDados.push(oDadosItem);
                    }
                }
            } else if(oCampoPreencher instanceof Object) {  
                // Empilha os dados do objeto atual                  
                pilhaObjetosContinuar.unshift({
                        'objBase': oObjetoPreencher,
                        'objAtribuir': oDadosAtribuir,
                        'camposPreencher': camposPreencher,
                        'indice' : i
                });
                oObjetoPreencher = oCampoPreencher;
                camposPreencher = Object.keys(oObjetoPreencher);
                nomeAtributo = campo;
                i = 0;
                oDadosAtribuir = oDadosAtribuir[campo];
            } else {   
                oObjetoPreencher[campo] = oDadosAtribuir[campo];
            }
            
            if((i + 1) === camposPreencher.length &&
                pilhaObjetosContinuar.length > 0) {

                let objContinuar = pilhaObjetosContinuar.shift();
                oObjetoPreencher = objContinuar.objBase;
                camposPreencher = objContinuar.camposPreencher;
                oDadosAtribuir = objContinuar.objAtribuir;
                i = objContinuar.indice;
            }
        }
        
        if(instanciaComponente) {
            this.atualizarEstadoTela(instanciaComponente);
        }

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);

        return this.oDadosReferencia;
    };

    temDados() {

        if(this.oDadosReferencia && this.oDadosReferencia.dados_app) {
            let oDadosApp = this.oDadosReferencia.dados_app;
            let campos = Object.keys(oDadosApp);
            let campo;
            let oCampo;
            let oPilhaPendencias = [];
            let oCamposIgnorar = ['instrucao_usuario', 'chaves', 'dados_dispositivo'];

            for(let i = 0; i < campos.length; i++) {
                campo = campos[i];
                if(oCamposIgnorar.find((valor) => {return (valor === campo)})) {
                    continue;
                }
                oCampo = oDadosApp[campo];
            
                if(oCampo) {
                    if(oCampo instanceof Object) {
                        let oDadosAux = oCampo;

                        oPilhaPendencias.unshift({
                            'objPendente' : oDadosApp,
                            'camposPendentes' : campos,
                            'indice': i
                        });
                        if (oCampo instanceof Array && oCampo.length > 0) {
                            oDadosAux = oCampo[0];
                        }
                        oDadosApp = oDadosAux;
                        campos = Object.keys(oDadosAux);
                        i = 0;
                    } else if (typeof(oCampo) === 'string' && oCampo.trim()) {
                        return true;
                    } else if (typeof(oCampo) === 'number' && oCampo > 0) {
                        return true;
                    }
                }

                if((i + 1) === campos.length && oPilhaPendencias.length > 0) {

                    let objContinuar = oPilhaPendencias.shift();
                    oDadosApp = objContinuar.objPendente;
                    campos = objContinuar.camposPendentes;
                    i = objContinuar.indice;
                }
            }
        }
        return false;
    };

    coletarInformacoesDispositivo() {
        
        this.dadosDispositivo.device_id = DeviceInfo.getDeviceId();        
        this.dadosDispositivo.tipo_dispositivo = DeviceInfo.getDeviceType();
        this.dadosDispositivo.modelo = DeviceInfo.getModel();
        this.dadosDispositivo.nome_sistema = DeviceInfo.getSystemName();
        this.dadosDispositivo.versao_sistema = DeviceInfo.getSystemVersion();
        this.dadosDispositivo.id_unico = DeviceInfo.getUniqueId();
        this.dadosDispositivo.versao_sistema = DeviceInfo.getVersion();
        //this.oRegistradorLog.registrar(`Notch: ${DeviceInfo.hasNotch()}`);        
        //this.oRegistradorLog.registrar(`Tablet: ${DeviceInfo.isTablet()}`);
        //this.oRegistradorLog.registrar(`ReadableVersion: ${DeviceInfo.getReadableVersion()}`);


        // DeviceInfo.getCarrier().then((valor) => {
        //     let nomeFuncao = 'getCarrier';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Carrier: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getCodename().then((valor) => {
        //     let nomeFuncao = 'getCodename';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Codename: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        DeviceInfo.getDevice().then((valor) => {
            this.dadosDispositivo.dispositivo = valor;
        });
        DeviceInfo.getProduct().then((valor) => {
            this.dadosDispositivo.produto = valor;
        });
        DeviceInfo.getSerialNumber().then((valor) => {
            this.dadosDispositivo.numero_serial = valor;
        });
        DeviceInfo.getDeviceName().then((valor) => {
            this.dadosDispositivo.dispositivo = valor;
        });
        DeviceInfo.getDeviceToken().then((valor) => {
            this.dadosDispositivo.token_dispositivo = valor;
        });
        DeviceInfo.getHardware().then((valor) => {
            this.dadosDispositivo.hardware = valor;
        });
        DeviceInfo.getInstanceId().then((valor) => {
            this.dadosDispositivo.id_instancia = valor;
        });
        DeviceInfo.getManufacturer().then((valor) => {
            this.dadosDispositivo.fabricante = valor;
        });

        // DeviceInfo.getDisplay().then((valor) => {
        //     let nomeFuncao = 'getDisplay';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Display: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });	
        // DeviceInfo.getFontScale().then((valor) => {
        //     let nomeFuncao = 'getFontScale';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`FontScale: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getHost().then((valor) => {
        //     let nomeFuncao = 'getHost';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Host: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getMacAddress().then((valor) => {
        //     let nomeFuncao = 'getMacAddress';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`MacAddress: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getMaxMemory().then((valor) => {
        //     let nomeFuncao = 'getMaxMemory';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`MaxMemory: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getPowerState().then((valor) => {
        //     let nomeFuncao = 'getPowerState';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`PowerState: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getPreviewSdkInt().then((valor) => {
        //     let nomeFuncao = 'getPreviewSdkInt';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`PreviewSdkInt: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });                
        // DeviceInfo.getSecurityPatch().then((valor) => {
        //     let nomeFuncao = 'getSecurityPatch';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`SecurityPatch: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getSystemAvailableFeatures().then((valor) => {
        //     let nomeFuncao = 'getSystemAvailableFeatures';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`SystemAvailableFeatures: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        
        // DeviceInfo.getTags().then((valor) => {
        //     let nomeFuncao = 'getTags';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Tags: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getType().then((valor) => {
        //     let nomeFuncao = 'getType';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`Type: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getTotalDiskCapacity().then((valor) => {
        //     let nomeFuncao = 'getTotalDiskCapacity';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`TotalDiskCapacity: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getTotalMemory().then((valor) => {
        //     let nomeFuncao = 'getTotalMemory';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`TotalMemory: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        
        // DeviceInfo.getUsedMemory().then((valor) => {
        //     let nomeFuncao = 'getUsedMemory';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`UsedMemory: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.getUserAgent().then((valor) => {
        //     let nomeFuncao = 'getUserAgent';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`UserAgent: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });        
        // DeviceInfo.hasSystemFeature().then((valor) => {
        //     let nomeFuncao = 'hasSystemFeature';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`hasSystemFeature: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isAirplaneMode().then((valor) => {
        //     let nomeFuncao = 'isAirplaneMode';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isAirplaneMode: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isBatteryCharging().then((valor) => {
        //     let nomeFuncao = 'isBatteryCharging';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isBatteryCharging: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isEmulator().then((valor) => {
        //     let nomeFuncao = 'isEmulator';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isEmulator: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isLandscape().then((valor) => {
        //     let nomeFuncao = 'isLandscape';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isLandscape: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isLocationEnabled().then((valor) => {
        //     let nomeFuncao = 'isLocationEnabled';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isLocationEnabled: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isHeadphonesConnected().then((valor) => {
        //     let nomeFuncao = 'isHeadphonesConnected';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isHeadphonesConnected: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.isPinOrFingerprintSet().then((valor) => {
        //     let nomeFuncao = 'isPinOrFingerprintSet';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`isPinOrFingerprintSet: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        
        // DeviceInfo.supported32BitAbis().then((valor) => {
        //     let nomeFuncao = 'supported32BitAbis';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`supported32BitAbis: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.supported64BitAbis().then((valor) => {
        //     let nomeFuncao = 'supported64BitAbis';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`supported64BitAbis: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.supportedAbis().then((valor) => {
        //     let nomeFuncao = 'supportedAbis';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`supportedAbis: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
        // DeviceInfo.syncUniqueId().then((valor) => {
        //     let nomeFuncao = 'syncUniqueId';
        //     this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        //     this.oRegistradorLog.registrar(`UniqueId: ${valor}`);

        //     this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        // });
    }

    _atribuirDadosObjeto(oObjetoReceber, oDadosAtribuir) {        
        for(let campo in oObjetoReceber) {
            oObjetoReceber[campo] = this._atribuir(campo, oDadosAtribuir);
        }
    };

    _atribuir(nomeAtributo, oDadosAtribuir) {
        for(let campo in oDadosAtribuir) {
            if(nomeAtributo === campo) {
                return oDadosAtribuir[nomeAtributo];
            }
        }
    };

    _transportarLogServidor() {
        console.log(`[trisafeapp] App ativo = ${this.appAtivo}`);

        if(!this.appAtivo && this.dadosApp.controle_app.app_ativo) {
            
            this.dadosApp.controle_app.app_ativo = false;
            this.oRegistradorLog.transportar();
        } else {
            
            this.dadosApp.controle_app.app_ativo = true;
        }
    }
}