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
    BackHandler
} from 'react-native';
import { styles } from '../common/Estilos';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import { RNCamera } from 'react-native-camera';
import Orientation from 'react-native-orientation';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';
import { StackActions } from '@react-navigation/native';
import Svg, { Rect } from 'react-native-svg';

export default class TelaCapturaFotoCNH extends PureComponent {
    
    constructor(props, value) {
        super(props);
        
        Orientation.lockToLandscapeLeft();

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
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this._tratarVoltarPeloDispositivo = this._tratarVoltarPeloDispositivo.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'Produtos TriSafe a contratar.';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaCapturaFotoCNH.constructor() => Finalizou.');
        BackHandler.addEventListener('hardwareBackPress', this._tratarVoltarPeloDispositivo);
    }

    componentDidMount() {
        console.log('componentDidMount() ...');
        
        this.oDadosControleApp.abrir_camera = false;
    }
    
    componentWillUnmount() {
        console.log('componentWillUnmount(), vai registrar Orientation.lockToLandscapeLeft(); ao refocar...');
        this.registrarEventoFoco();
    }

    registrarEventoFoco() {
        this.oNavegacao.addListener('focus', () => {
            Orientation.lockToLandscapeLeft();
        });
    }

    componentDidUpdate() {
        console.log('componentDidUpdate() ...');
    }
    
    voltar() {
        this.oNavegacao.goBack();
    }

    _tratarVoltarPeloDispositivo() {
        console.log('Desbloqueando orientacao horizontal...');
        Orientation.unlockAllOrientations;
        
        const pop = StackActions.pop(1);

        console.log('Removendo tela camera...', JSON.stringify(pop));
        this.oNavegacao.dispatch(pop);
    }

    capturarFotoCNH() {
        
        if (this.camera) {
            console.log('Tirando foto...');
            
            const options = { quality: 0.5, base64: true, doNotSave: true, orientation: 'landscapeLeft'};
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
            flex: 1,
            justifyContent: 'flex-start',
            //alignItems: 'center',
            // flexDirection: 'column',
            // justifyContent: 'center',
            // alignItems: 'center',
            //backgroundColor: '#f5f5f5',
           // padding: 50,
        }

        // if(!this.oDadosControleApp.abrir_camera){
        //     console.log('Tela Abrindo camera...');
        //     return (
        //         <View style={styles.areaCliente}>
        //             <Text>Abrindo camera...</Text>
        //         </View>
        //     );
        // } else {
        console.log('Abrindo camera...');
        return (
            <View style={estiloAreaFoto}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={estiloFoto}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    onCameraReady={() => {
                        // this.oGerenciadorContextoApp.dadosAppGeral.a = 1;
                        // const pop = StackActions.pop(1);

                        // console.log('Removendo tela camera...', JSON.stringify(pop));
                        // this.oNavegacao.dispatch(pop);

                        // const push = StackActions.push('Cadastro Cliente', { screen: 'Foto CNH' });

                        // this.oNavegacao.dispatch(push);
                    }}
                    captureAudio={false}
                    autoFocusPointOfInterest={{x: 0.7, y: 0.7}}
                    // androidCameraPermissionOptions={{
                    //     title: 'Permission to use camera',
                    //     message: 'We need your permission to use your camera',
                    //     buttonPositive: 'Ok',
                    //     buttonNegative: 'Cancel',
                    // }}
                    // androidRecordAudioPermissionOptions={{
                    //     title: 'Permission to use audio recording',
                    //     message: 'We need your permission to use your audio',
                    //     buttonPositive: 'Ok',
                    //     buttonNegative: 'Cancel',
                    // }}
                    onGoogleVisionBarcodesDetected={({ barcodes }) => {
                        console.log(barcodes);
                    }}
                >
                    <View style={{flex:1, flexDirection:'column', justifyContent:'space-between'}}>
                        <View style={{flex:.2, backgroundColor:'black', opacity: .7, justifyContent:'center', alignItems:'center'}}>
                            <Text style={{color:'white', fontSize:16}}>Posicione sua carteira de motorista nos limites do retangulo em amarelo e tire a foto.</Text>
                        </View>
                        <View style={{flex: 1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{width:"17%", backgroundColor:'black', opacity: .7}}>
                                        
                            </View>
                            <Svg style={{width:"66%", height:"100%"}}>
                                <Rect
                                    width="100%"
                                    height="100%"
                                    
                                    stroke="yellow"
                                    strokeWidth="3"
                                />
                            </Svg>
                            <View style={{width:"17%",  backgroundColor:'black', opacity: .7, justifyContent:'center', alignItems:'center'}}>
                                <TouchableOpacity onPress={this.capturarFotoCNH}>
                                    <Icon name="camera" size={40} color="blue" />
                                </TouchableOpacity>   
                                <TouchableOpacity onPress={() => {this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                                    <Icon name="camera" size={40} color="yellow" />
                                </TouchableOpacity> 
                            </View>
                        </View>
                        <View style={{flex:.1, flexDirection:'column',  backgroundColor:'black', opacity: .7}}>
                            
                        </View>
                    </View>
                </RNCamera>
            </View>
        );
    }
}
TelaCapturaFotoCNH.contextType = ContextoApp;

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       flexDirection: 'column',
//       backgroundColor: 'black',
//     },
//     preview: {
//       flex: 1,
//       justifyContent: 'flex-end',
//       alignItems: 'center',
//     },
//     capture: {
//       flex: 0,
//       backgroundColor: '#fff',
//       borderRadius: 5,
//       padding: 2,
//       paddingVertical: 7,
//       alignSelf: 'center',
//       margin: 7,
//     },
//     imgBG: {
//         flex: 1,
//         alignItems:'center',
//         justifyContent:'space-between'
//     }
// });