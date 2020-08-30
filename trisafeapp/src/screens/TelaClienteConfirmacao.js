/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    ScrollView,
    Alert,
    View
} from 'react-native';
import ComunicacaoHTTP from './../common/ComunicacaoHTTP';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from './../common/CabecalhoTela';
import { styles, theme } from './../common/Estilos';
import AreaRodape from './../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Util from '../common/Util';

export default class TelaClienteConfirmacao extends Component {
	
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaClienteConfirmacao.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;            
            this.oComunicacaoHTTP = new ComunicacaoHTTP(this.oGerenciadorContextoApp, this);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.salvar = this.salvar.bind(this);
        this.tratarDadosRetorno = this.tratarDadosRetorno.bind(this);
        this.voltar = this.voltar.bind(this);

        this.oRegistradorLog.registrar('TelaClienteConfirmacao.constructor() => Finalizou.');
    }

    salvar() {
        try {
            let metodoHTTP = '/clientes/incluir/';

            if(!this.oDadosControleApp.novo_cadastro) {
                metodoHTTP = '/clientes/alterar/';
            }
            
            let oDadosParametros = JSON.stringify(this.state);

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoHTTP, oDadosParametros, this.tratarDadosRetorno, true, true);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosRetorno(oDados, oEstado) {

        if (oEstado.mensagem && oEstado.mensagem.trim()){
            Alert.alert('Trisafe', oEstado.mensagem);
        }
                
        if(oEstado.ok) {
            this.oDadosControleApp.novo_cadastro = false;
            this.oNavegacao.navigate('Produtos', this.state);
        }
    }
     
    voltar() {
        //this.oGerenciadorContextoApp.atualizarEstadoTela(this.oGerenciadorContextoApp.telaAnterior);
        this.oNavegacao.goBack();
    }

    botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>;        
    botaoConfirmar = () => <Button title="Confirmar" onPress={this.salvar} loading={this.oDadosControleApp.processando_requisicao} ></Button>;

    render() {
        let botoesTela = [ { element: this.botaoVoltar }, { element: this.botaoConfirmar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}
TelaClienteConfirmacao.contextType = ContextoApp;

export class AreaDados extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let oDadosApp = this.props.dadosApp;
        let oDadosCliente = oDadosApp.cliente;

        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input label="Nome Completo" disabled={true} style={styles.Input} value={oDadosCliente.nome} ></Input>                
                            <Input label="E-mail" disabled={true} style={styles.Input} value={oDadosCliente.email} ></Input>
                            <Input label="CPF" disabled={true} style={styles.Input} value={oDadosCliente.cpf} ></Input>
                            <Input label="Telefone" disabled={true} style={styles.Input} value={oDadosCliente.telefone} ></Input>
                            <Input label="Nome Usuário" disabled={true} style={styles.Input} value={oDadosCliente.nome_usuario} ></Input>
                            <Input label="Rua" disabled={true} style={styles.Input} value={oDadosCliente.rua} ></Input>
                            <Input label="Número" disabled={true} style={styles.Input} value={oDadosCliente.numero} ></Input>
                            <Input label="Complemento" disabled={true} style={styles.Input} value={oDadosCliente.complemento} ></Input>
                            <Input label="Bairro" disabled={true} style={styles.Input} value={oDadosCliente.bairro} ></Input>                
                            <Input label="Cep" disabled={true} style={styles.Input} value={oDadosCliente.cep} ></Input>
                            <Input label="Cidade" disabled={true} style={styles.Input} value={oDadosCliente.cidade} ></Input>
                            <Input label="Estado" disabled={true} style={styles.Input} value={oDadosCliente.uf} ></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}