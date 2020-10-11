'use strict';
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
    View,
} from 'react-native';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import AreaRodape from '../common/AreaRodape';
import { ContextoApp } from '../contexts/ContextoApp';
import Orientation from 'react-native-orientation';
import { inicializarContextoComum } from '../common/Configuracao';

const NOME_COMPONENTE = 'TelaVeiculoCadastro';
const INSTRUCAO_INICIAL = 'Informe os dados do seu veículo.';

export default class TelaVeiculoCadastro extends Component {
	
    constructor(props, contexto) {
        super();
        
        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.obter = this.obter.bind(this);
        this.tratarDadosVeiculo = this.tratarDadosVeiculo.bind(this);
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        if(!this.oDadosControleApp.novo_veiculo && !this.oDadosVeiculoAtual.placa) {
            this.obter();
        }

        Orientation.unlockAllOrientations();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    obter() {
        try {
            let metodoURI = '/veiculos/obter/';
            let oDadosRequisicao = {
                veiculo: this.oDadosVeiculoAtual,
            }
            oDadosRequisicao.veiculo.cliente = this.oDadosCliente;

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosVeiculo);

        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosVeiculo(oDados, oEstado) {
        let nomeFuncao = 'tratarDadosVeiculo';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        if(oEstado.ok) {
            this.oGerenciadorContextoApp.atribuirDados('veiculo_atual', oDados, this);
        }
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    avancar() {
        // Vai direto pra contratacao.
        this.oNavegacao.navigate('Contratacao');
    }

    voltar() {
        this.oNavegacao.goBack();
    }

    render() {
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Avançar" onPress={this.avancar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar } ];

        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Cadastro Veículo' navigation={this.oNavegacao} />
                <AreaDados dadosApp={this.oDadosApp}/>
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        );
    }
}

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this);
    }

    render() {
        let oDadosVeiculo = this.oDadosVeiculoAtual;

        return (
            <View style={styles.areaDadosCliente}>
                <ScrollView>
                    <ThemeProvider theme={theme}>
                        <View>
                            <Input placeholder="Informe sua Placa" label="Placa" value={oDadosVeiculo.placa} onChangeText={(valor) => { oDadosVeiculo.rua = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o modelo do Veículo" label="Modelo" value={oDadosVeiculo.modelo} onChangeText={(valor) => { oDadosVeiculo.numero = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe a marca do Veículo" label="Marca" value={oDadosVeiculo.marca} onChangeText={(valor) => { oDadosVeiculo.numero = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o ano do Veículo" label="Ano" value={oDadosVeiculo.ano} onChangeText={(valor) => { oDadosVeiculo.numero = valor; this.setState(this.oDadosApp)}}></Input>
                            <Input placeholder="Informe o apelido do Veículo" label="Apelido" value={oDadosVeiculo.apelido} onChangeText={(valor) => { oDadosVeiculo.numero = valor; this.setState(this.oDadosApp)}}></Input>
                        </View>
                    </ThemeProvider>
                </ScrollView>
            </View>
        );
    }
}

TelaVeiculoCadastro.contextType = ContextoApp;
AreaDados.contextType = ContextoApp;