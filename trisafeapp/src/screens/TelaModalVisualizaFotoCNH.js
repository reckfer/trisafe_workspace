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
} from 'react-native';
import ComunicacaoHTTP from '../common/ComunicacaoHTTP';
import { Button } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';
import { styles } from '../common/Estilos';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { clonarObjeto, DADOS_FOTOS } from '../contexts/DadosAppGeral';

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
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;
    botaoIncluirContrato = () => <Button title="Avançar" onPress={this.incluirContrato} loading={this.oDadosControleApp.processando_requisicao} ></Button>;
    
    render() {
        
        if(this.oDadosApp.fotos.foto_cnh_base64) {

            console.log('Vai renderizar foto tirada...');
            let estiloAreaFoto = clonarObjeto(styles.areaCliente);
            estiloAreaFoto.flex = .8
            estiloAreaFoto.justifyContent= 'center';
            estiloAreaFoto.alignItems = 'center';
            estiloAreaFoto.margin = 30;
            estiloAreaFoto.marginTop = 50;
            estiloAreaFoto.marginRight = 60;

            let estiloFoto = clonarObjeto(styles.areaCliente);
            estiloFoto.alignSelf= 'center';
            
            estiloFoto.width = '90%';
            estiloFoto.height = '80%';
            estiloFoto.backgroundColor = 'yellow';

            return(
                <View style={styles.areaCliente}>
                    <View style={estiloAreaFoto}>
                        <ImageBackground source={ { uri: `data:image/png;base64,${this.oDadosApp.fotos.foto_cnh_base64}` }} style={estiloFoto}>
                            
                        </ImageBackground>
                        
                    </View>
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity onPress={this.capturarNovamente} >
                                <Icon name="camera" size={40} color="orange" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.enviarFotoCNHServidor} >
                                <Icon name="camera" size={40} color="orange" />
                            </TouchableOpacity>
                            <View style={{backgroundColor: 'blue', transform: [{ rotate: '90deg' }]}}>
                                <Text>Gostou da foto?</Text>
                            </View>
                    </View>
                </View>
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