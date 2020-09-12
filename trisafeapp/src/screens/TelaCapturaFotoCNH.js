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
import {
    BarcodeMaskWithOuterLayout
  } from '@nartc/react-native-barcode-mask';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';
import { StackActions } from '@react-navigation/native';
import Svg, { Rect } from 'react-native-svg';

export default class TelaCapturaFotoCNH extends PureComponent {
    
    constructor(props, value) {
        super(props);
    
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaCapturaFotoCNH.constructor() => Iniciou.');

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
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'Produtos TriSafe a contratar.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaCapturaFotoCNH.constructor() => Finalizou.');
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
            
            const options = { quality: 0.5, base64: true, doNotSave: true,};
            this.camera.takePictureAsync(options).then((data) => {
                
                console.log('Foto tirada: ', data.uri);

                let dadosFotos = clonarObjeto(DADOS_FOTOS);
                dadosFotos.uri_local_cnh = data.uri;
                dadosFotos.foto_cnh_base64 = data.base64;
                
                this.oDadosApp.fotos = dadosFotos;

                const pop = StackActions.pop(1);

                console.log('Removendo tela camera...', JSON.stringify(pop));
                this.oNavegacao.dispatch(pop);

                // const push = StackActions.push('Cadastro Cliente', { screen: 'Visualizacao Foto CNH' });

                // this.oNavegacao.dispatch(push);
                
                this.oNavegacao.navigate('Visualizacao Foto CNH');
            });

        }
    };

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        console.log('Vai renderizar camera.');

        let estiloAreaFoto =  {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            // flexDirection: 'column',
            // justifyContent: 'flex-start',
            //alignItems: 'center',
            backgroundColor: 'black',
           // padding: 50,
        }
        let estiloFoto =  {
            flex: .95,
            justifyContent: 'flex-start',
            alignItems: 'center',
            // flexDirection: 'column',
            // justifyContent: 'center',
            // alignItems: 'center',
            //backgroundColor: '#f5f5f5',
           // padding: 50,
        }
        
        return (
            <View style={estiloAreaFoto}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={estiloFoto}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    captureAudio={false}
                    autoFocusPointOfInterest={{x: 0.7, y: 0.7}}
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
                >
                    <Svg height="100%" width="100%" >
                        <Rect
                            // x="0"
                            // y="0"
                            width="100%"
                            height="100%"
                            
                            stroke="grey"
                            strokeWidth="50"
                            //origin="10, 10"
                            // originX="50"
                            // originY="50"
                            //fillRule='evenodd'
                            // strokeDasharray='round'
                            // strokeLinejoin='round'
                            opacity='70'
                            
                        />
                    </Svg>
                    {/* <BarcodeMaskWithOuterLayout
                        showAnimatedLine={false}
                        maskOpacity={.7}
                        width='90%'
                        height='80%'
                    /> */}
                </RNCamera>
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this.capturarFotoCNH}>
                        <Icon name="camera" size={40} color="blue" style={{transform: [{ rotate: '90deg' }]}} />
                    </TouchableOpacity>
                </View>
                {/* <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => {this.camera.getAvailablePictureSizes().then(valor => {console.log(JSON.stringify(valor));})}} style={styles.capture}>
                        <Icon name="camera" size={40} color="blue" style={{transform: [{ rotate: '90deg' }]}} />
                    </TouchableOpacity>
                </View> */}
            </View>
        );
    }
}
TelaCapturaFotoCNH.contextType = ContextoApp;

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
      padding: 2,
      paddingVertical: 7,
      alignSelf: 'center',
      margin: 7,
    },
    imgBG: {
        flex: 1,
        alignItems:'center',
        justifyContent:'space-between'
    },
  });