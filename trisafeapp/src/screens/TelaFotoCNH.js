'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Alert,
    View,
    Text,
    ImageBackground,
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import { RNCamera } from 'react-native-camera';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';

export default class TelaFotoCNH extends PureComponent {
    
    constructor(props, value) {
        super(props);
    
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaFotoCNH.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oDadosInstrucao = this.oDadosApp.instrucao_usuario;
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        this.capturarFotoCNH = this.capturarFotoCNH.bind(this);
        this.enviarFotoCNHServidor = this.enviarFotoCNHServidor.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.capturarNovamente = this.capturarNovamente.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'Produtos TriSafe a contratar.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaFotoCNH.constructor() => Finalizou.');
    }

    componentDidMount() {
        console.log('componentDidMount() ...');
    }

    componentDidUpdate() {
        console.log('componentDidUpdate() ...');
    }
    
    voltar() {
        this.oNavegacao.goBack();
    }

    capturarFotoCNH() {
        
        if (this.camera) {
            console.log('Tirando foto...');
            
            const options = { quality: 0.5, base64: true};
            this.camera.takePictureAsync(options).then((data) => {
                
                console.log('Foto tirada: ', data.uri);

                let dadosFotos = clonarObjeto(DADOS_FOTOS);
                dadosFotos.uri_local_cnh = data.uri;
                dadosFotos.foto_cnh_base64 = data.base64;
                
                this.oDadosApp.fotos = dadosFotos;
                this.oGerenciadorContextoApp.atualizarEstadoTela(this);
            });

        }
    };

    enviarFotoCNHServidor() {
        try {
            let metodoURI = '/clientes/salvar_foto_cnh/';

            let oParametrosFoto = {
                dados_app: {
                    cliente: this.oDadosApp.cliente,
                    fotos: this.oDadosApp.fotos,
                    chaves: this.oDadosApp.chaves,
                }
            }

            let oDadosParametros = JSON.stringify(oParametrosFoto);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno, true, true);

        } catch (oExcecao) {

            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {
        
        if (oEstado.mensagem && oEstado.mensagem.trim()){
            Alert.alert('Trisafe', oEstado.mensagem);
        }
                
        if(oEstado.ok) {
            this.oNavegacao.navigate('Contrato', this.state);
        }
    }
    capturarNovamente() {
        
        this.oDadosApp.fotos = clonarObjeto(DADOS_FOTOS);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        
        if(this.oDadosApp.fotos.uri_local_cnh) {
            console.log('Vai renderizar foto tirada...', this.oDadosApp.fotos.uri_local_cnh);
            return(
                <View style={styles.container}>
                    <ImageBackground source={ { uri: this.oDadosApp.fotos.uri_local_cnh }} style={styles.imgBG} resizeMode='stretch'>
                        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={this.capturarNovamente} >
                                <Icon name="camera" size={40} color="orange" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.enviarFotoCNHServidor} >
                                <Icon name="camera" size={40} color="orange" />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                </View>
            );
        } else {
            console.log('Vai renderizar camera.');
            return (
                <View style={styles.container}>
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={styles.preview}
                        type={RNCamera.Constants.Type.back}
                        flashMode={RNCamera.Constants.FlashMode.on}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        androidRecordAudioPermissionOptions={{
                            title: 'Permission to use audio recording',
                            message: 'We need your permission to use your audio',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        onGoogleVisionBarcodesDetected={({ barcodes }) => {
                            console.log(barcodes);
                        }}
                    />
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={this.capturarFotoCNH} style={styles.capture}>
                            <Icon name="camera" size={40} color="orange" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }
}
TelaFotoCNH.contextType = ContextoApp;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 3,
      paddingHorizontal: 10,
      alignSelf: 'center',
      margin: 10,
    },
    imgBG: {
        flex: 1,
        alignItems:'center',
        justifyContent:'space-between'
    },
  });