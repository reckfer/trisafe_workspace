'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Alert,
    View,
    Text,
    ImageBackground, 
    ScrollView,
    Image
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import { styles } from '../common/Estilos';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';
import { StackActions } from '@react-navigation/native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default class TelaModalVisualizaFotoCNH extends Component {
    
    constructor(props, value) {
        super(props);
    
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaModalVisualizaFotoCNH.constructor() => Iniciou.');

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
        this.enviarFotoCNHServidor = this.enviarFotoCNHServidor.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.capturarNovamente = this.capturarNovamente.bind(this);
        this.voltar = this.voltar.bind(this);
        
        this.texto_instrucao = 'A foto ficou nítida?';
        this.oDadosInstrucao.texto_instrucao = this.texto_instrucao;
        this.oRegistradorLog.registrar('TelaModalVisualizaFotoCNH.constructor() => Finalizou.');
    }

    componentDidMount() {
        console.log('componentDidMount() ...');
    }

    componentDidUpdate() {
        console.log('componentDidUpdate() ...');
    }

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

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosParametros, this.tratarDadosRetorno, false, true);

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
        this.voltar();
    }

    voltar() {
        const pop = StackActions.pop(1);
                
        console.log('Removendo tela imagem CNH...', JSON.stringify(pop));
        this.oNavegacao.dispatch(pop);

        const push = StackActions.push('Cadastro Cliente', { screen: 'Foto CNH' });

        this.oNavegacao.dispatch(push);
        // this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        
        if(this.oDadosApp.fotos.foto_cnh_base64) {

            console.log('Vai renderizar foto tirada...');
            //let estiloAreaFoto = clonarObjeto(styles.areaCliente);
            // estiloAreaFoto.flex = 1
            // estiloAreaFoto.justifyContent= 'center';
            // estiloAreaFoto.alignItems = 'center';
            // estiloAreaFoto.backgroundColor = 'green';
            // estiloAreaFoto.margin = 30;
            // estiloAreaFoto.marginTop = 50;
            // estiloAreaFoto.marginRight = 60;

            let estiloAreaFoto =  {
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                // flexDirection: 'column',
                // justifyContent: 'flex-start',
                //alignItems: 'center',
                //backgroundColor: '#f5f5f5',
               // padding: 50,
            }
            let estiloFoto =  {
                flex: .95,
                //transform: [{ rotate: '90deg' }]
                // flexDirection: 'column',
                // justifyContent: 'center',
                // alignItems: 'center',
                //backgroundColor: '#f5f5f5',
               // padding: 50,
            }

            return(
                <SafeAreaView style={styles.areaCliente}>
                    <View style={estiloAreaFoto}>
                        <ImageBackground source={ { uri: `data:image/png;base64,${this.oDadosApp.fotos.foto_cnh_base64}` }} 
                            style={estiloFoto}>
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
                        </ImageBackground>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity onPress={this.capturarNovamente} >
                                <Icon name="camera" size={40} color="orange" style={{transform: [{ rotate: '90deg' }]}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.enviarFotoCNHServidor} style={{transform: [{ rotate: '90deg' }]}}>
                                <Icon name="camera" size={40} color="orange" />
                            </TouchableOpacity>
                            {/* <View style={{backgroundColor: 'blue', transform: [{ rotate: '90deg' }]}}>
                                <Text>Gostou da foto?</Text>
                            </View> */}
                    </View>
                </SafeAreaView>
            );
        } else {
            return(
                <View style={styles.areaCliente}>
                    <Text>Não há foto para exibir.</Text>
                </View>
            );
        }
    }
}
TelaModalVisualizaFotoCNH.contextType = ContextoApp;