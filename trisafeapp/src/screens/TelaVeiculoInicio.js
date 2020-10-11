'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button } from 'react-native-elements';
import {
    FlatList,
    Platform,
    Text,
    View,
} from 'react-native';
import Cabecalho from '../common/CabecalhoTela';
import { styles, theme } from '../common/Estilos';
import { ContextoApp } from '../contexts/ContextoApp';
import { inicializarContextoComum } from '../common/Configuracao';
import { clonarObjeto, DADOS_VEICULO } from '../contexts/DadosAppGeral';
import AreaRodape from '../common/AreaRodape';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

const NOME_COMPONENTE = 'TelaVeiculoInicio';
const INSTRUCAO_INICIAL = '';

export default class TelaVeiculoInicio extends Component {
    
    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);

        this.listarVeiculosCliente = this.listarVeiculosCliente.bind(this);
        this.tratarDadosVeiculosCliente = this.tratarDadosVeiculosCliente.bind(this);
        this.avancar = this.avancar.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        let nomeFuncao = 'componentDidMount';
        
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        
        this.listarVeiculosCliente();

        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }
    
    listarVeiculosCliente() {
        let nomeFuncao = 'listarVeiculosCliente';
        
        try {
            this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

            let metodoURI = '/veiculos/listar_por_cliente/';
            let oDadosRequisicao = {
                veiculo: clonarObjeto(DADOS_VEICULO)
            }
            oDadosRequisicao.veiculo.cliente = this.oDadosCliente;

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosVeiculosCliente);
            
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosVeiculosCliente(oDados, oEstado) {
        let nomeFuncao = 'listarVeiculosCliente';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if(oEstado.cod_mensagem === 'NaoCadastrado') {
            
            this.oDadosControleApp.novo_veiculo = true;
            this.avancar();
        } else {

            if(oDados) {
                this.oGerenciadorContextoApp.atribuirDados('veiculos', oDados, this);
            }
        }
     
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    avancar() {
        
        this.oNavegacao.navigate('Veiculo Cadastro');
    }

    voltar() {
        this.oNavegacao.goBack();
    }
    
    render() {
        let botaoVoltar = () => <Button title="Voltar" onPress={this.voltar} ></Button>
        let botaoAvancar = () => <Button title="Avançar" onPress={this.avancar} ></Button>
        
        let botoesTela = [ { element: botaoVoltar }, { element: botaoAvancar} ];
        
        return (
            <View style={styles.areaCliente}>
                <Cabecalho titulo='Meus veículos' navigation={this.oNavegacao} />
                <AreaDados navigation={this.oNavegacao} />
                <AreaRodape botoes={botoesTela} mensagem={''}/>
            </View>
        )
    }
}

// const renderItem = ({item, index, separators}) => (
//         <TouchableOpacity key={item.key} onPress={() => {}} style={{ margin: 5, marginTop:20}}>
//             <View >
//                 <Text>{item.placa}</Text>
//             </View>
//         </TouchableOpacity>
//     );

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.renderItem = this.renderItem.bind(this);
        this.irParaCadastro = this.irParaCadastro.bind(this);
    }
    
    irParaCadastro(indiceLista) {
        let oVeiculo = this.oDadosVeiculos[indiceLista];
        oVeiculo.indice_lista = indiceLista;
        console.log('Veiculo: ', oVeiculo);
        
        this.oDadosApp.veiculo_atual = oVeiculo;
        this.oDadosControleApp.novo_veiculo = false;
        this.oNavegacao.navigate('Veiculo Cadastro');
    }

    renderItem({item, index, separators}) {

        return (
            <TouchableOpacity key={item.key} onPress={() => {this.irParaCadastro(index)}} style={{ margin: 5, marginTop:20}}>
                <View >
                    <Text>{item.placa}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        this.oNavegacao = this.props.navigation;
        this.oDadosControleApp.novo_veiculo = false;
        let areaVeiculos = (
            <View>
                <Text>Buscando veículos cadastrados. Aguarde...</Text>
            </View>
        );
        
        if(this.oDadosVeiculos && this.oDadosVeiculos.length > 0) {
            let listaVeiculos = this.oDadosVeiculos.slice(0);
            
            areaVeiculos = (
                <FlatList
                    // ItemSeparatorComponent = {
                    //     Platform.OS !== 'android' &&
                    //     (({ highlighted }) => (
                    //     <View
                    //         style={[
                    //         style.separator,
                    //         highlighted && { marginLeft: 0 }
                    //         ]}
                    //     />
                    //     ))
                    // }
                    data={listaVeiculos}
                    renderItem={this.renderItem}
                    keyExtractor={(item) => item.placa}
                    //extraData={{tentando_enteder: true}}
                /> 
            );
        }
        
        return (
            <View style={styles.areaDadosCliente}>
                <ThemeProvider theme={theme}>
                    <SafeAreaView style={styles.areaCliente}>
                        {areaVeiculos}            
                    </SafeAreaView>
                </ThemeProvider>
            </View>
        );
    }
}
TelaVeiculoInicio.contextType = ContextoApp;
AreaDados.contextType = ContextoApp;