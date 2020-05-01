/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button } from 'react-native-elements';
// import { PushNotification } from 'react-native-push-notification';
// import RNFetchBlob from 'rn-fetch-blob';
import {
    ScrollView,
    Alert,
    View,
    // PermissionsAndroid
} from 'react-native';
import Util from '../common/Util';
import Cabecalho from '../common/CabecalhoTela';
import AreaBotoes from '../common/AreaBotoes';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';

export default class TelaClienteInicio extends Component {
    
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaClienteInicio.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oUtil = new Util(this.oGerenciadorContextoApp);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.obterCliente = this.obterCliente.bind(this);
        this.tratarDadosCliente = this.tratarDadosCliente.bind(this);
        this.irParaTestesRapidos = this.irParaTestesRapidos.bind(this);

        this.oRegistradorLog.registrar('TelaClienteInicio.constructor() => Finalizou.');
    }

    obterCliente() {
        try {
            let url = this.oUtil.getURL('/clientes/obter/');

            this.oDadosControleApp.processando_requisicao = true;
            let dadosParametros = JSON.stringify(this.oDadosApp);

            this.oRegistradorLog.registrar(`TelaBoletoEmissao.obterBoleto => Vai chamar a url ${url}, via POST. Parametros body: ${dadosParametros}`);

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);

            fetch(url, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
              })
                .then(this.oUtil.obterJsonResposta)
                .then((oJsonDados) => {
                    this.oUtil.tratarRetornoServidor(oJsonDados, this.tratarDadosCliente, true);
                })
                .catch(function (erro) {
                    Alert.alert('Trisafe', erro.message);
                    throw erro;
                });
        } catch (exc) {
            Alert.alert('Trisafe', exc.message);
            throw exc;
        }
    }

    tratarDadosCliente(oDados, oEstado) {
        let irPara = true;
        this.oDadosControleApp.processando_requisicao = false;

        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            this.oDadosControleApp.novo_cadastro = true;
            Alert.alert('Trisafe', 'Informe seus dados para realizar o cadastro.');
        } else {
            if(oEstado.ok){
                this.oDadosControleApp.novo_cadastro = false;
            } else {
                this.oGerenciadorContextoApp.atualizarEstadoTela(this);
                irPara = false;
            }

            if (oEstado.mensagem && oEstado.mensagem.trim()) {
                Alert.alert('Trisafe', oEstado.mensagem);
            } else {
                Alert.alert('Trisafe', 'Atualize seus dados cadastrais.');
            }
        }
        this.oGerenciadorContextoApp.atribuirDados('cliente', oDados);

        if(irPara) {            
            this.oNavegacao.navigate('Dados pessoais', this.state);
        }
    }

    irParaTestesRapidos() {

        this.oNavegacao.navigate('Testes', this.state);
    }

    botaoIniciar = () => <Button title="Iniciar" onPress={this.obterCliente} loading={this.oDadosControleApp.processando_requisicao}></Button>;
    botaoTestesRapidos = () => <Button title="Testes Rápidos" onPress={this.irParaTestesRapidos} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoIniciar }, { element: this.botaoTestesRapidos} ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Meus dados' nomeTela='Início' />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaBotoes botoes={botoesTela} />
            </View>
        )
    }
}

TelaClienteInicio.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;
        
        return (
            <ScrollView>
                <ThemeProvider theme={theme}>
                    <View style={styles.areaDadosCliente}>
                        <Input placeholder="Informe seu E-Mail" label="E-Mail" value={oDadosCliente.email} onChangeText={(valor) => { oDadosCliente.email = valor; this.setState(this.props)}}></Input>
                        <Input placeholder="Informe seu CPF" label="CPF" value={oDadosCliente.cpf} onChangeText={(valor) => { oDadosCliente.cpf = valor; this.setState(this.props)}}></Input>
                    </View>
                </ThemeProvider>
            </ScrollView>
        );
    }
}