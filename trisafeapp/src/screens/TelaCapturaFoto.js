'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { PureComponent } from 'react';
import {
    View,
    Text,
    BackHandler
} from 'react-native';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import { RNCamera } from 'react-native-camera';
import Orientation from 'react-native-orientation';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackActions } from '@react-navigation/native';
import Svg, { Rect } from 'react-native-svg';

const NOME_COMPONENTE = 'TelaCapturaFoto';
const INSTRUCAO_INICIAL = 'Posicione o documento no retângulo e tire uma foto.';

export default class TelaCapturaFoto extends PureComponent {
    
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        this.oDadosControleApp.tela_na_horizontal = true;

        this.capturarFotoCNH = this.capturarFotoCNH.bind(this);
        this.registrarEventoFoco = this.registrarEventoFoco.bind(this);
        this._tratarVoltarPeloDispositivo = this._tratarVoltarPeloDispositivo.bind(this);

        BackHandler.addEventListener('hardwareBackPress', this._tratarVoltarPeloDispositivo);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        Orientation.lockToLandscapeLeft();
        this.oDadosControleApp.abrir_camera = false;

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    
    componentWillUnmount() {
        this.registrarEventoFoco();
    }

    registrarEventoFoco() {
        this.oNavegacao.addListener('focus', () => {
            Orientation.lockToLandscapeLeft();
        });
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

                // let dadosFotos = clonarObjeto(DADOS_FOTOS);
                // dadosFotos.uri_local_cnh = data.uri;
                // dadosFotos.foto_cnh_base64 = data.base64;
                // this.oDadosApp.foto = dadosFotos;

                this.oDadosFoto.caminho_local = data.uri;
                this.oDadosFoto.foto_base64 = data.base64;

                const pop = StackActions.pop(1);

                console.log('Removendo tela camera...', JSON.stringify(pop));
                this.oNavegacao.dispatch(pop);

                //const push = StackActions.push('Modais', { screen: 'Visualizacao Foto' });
                this.oNavegacao.navigate('Visualizacao Foto');
            }).catch((oExcecao) => {
                this.oUtil.tratarExcecao(oExcecao);
            });
        }
    };

    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        let estiloAreaFoto =  {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            backgroundColor: 'black',
        }
        let estiloFoto =  {
            flex: 1,
            justifyContent: 'flex-start',
        }
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
                    }}
                    captureAudio={false}
                    autoFocusPointOfInterest={{x: 0.7, y: 0.7}}
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

TelaCapturaFoto.contextType = ContextoApp;