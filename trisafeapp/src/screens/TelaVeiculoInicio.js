'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ThemeProvider, Input, Button, ButtonGroup } from 'react-native-elements';
import {
    Alert,
    FlatList,
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
import Icon from 'react-native-vector-icons/FontAwesome';
import Util from '../common/Util';
import MensagemModal from '../common/MensagemModal';

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

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, this.tratarDadosVeiculosCliente, true);
            
            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarDadosVeiculosCliente(oDados, oEstado) {
        let nomeFuncao = 'listarVeiculosCliente';
        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);
        let mensagem = '';

        if (oEstado.mensagem && oEstado.mensagem.trim()) {
            mensagem = oEstado.mensagem;
        }

        if(!oEstado.ok) {
            if(oEstado.cod_mensagem === 'NaoCadastrado') {
                
                this.oDadosControleApp.novo_veiculo = true;
                mensagem += '\n\nAdicione um veículo para rastreamento.';

                this.oUtil.exibirMensagemUsuario(mensagem, this.avancar);
            } else {
                this.oUtil.exibirMensagemUsuario(mensagem, () => {});
            }
        } else {
               
            this.oUtil.exibirMensagemUsuario(mensagem, () => {});

            if(oDados) {
                this.oGerenciadorContextoApp.atribuirDados('veiculos', oDados, this);
            }            
        }
     
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    avancar() {
        this.oNavegacao.navigate('Contratacao');
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

export class AreaDados extends Component {

    constructor(props, contexto) {
        super();

        inicializarContextoComum(props, contexto, this, INSTRUCAO_INICIAL);
        
        this.renderItem = this.renderItem.bind(this);
        this.irParaCadastro = this.irParaCadastro.bind(this);
        this.adicionar = this.adicionar.bind(this);
        this.editar = this.editar.bind(this);
        this.solicitarExclusao = this.solicitarExclusao.bind(this);
        this.excluir = this.excluir.bind(this);
        this.tratarRetornoExclusao = this.tratarRetornoExclusao.bind(this);
        // TODO: mover este metodo para uma classe comum
        this.montarIcone = this.montarIcone.bind(this);
    }
    
    adicionar() {        
        this.oDadosApp.veiculo_atual = clonarObjeto(DADOS_VEICULO);
        
        this.oDadosControleApp.novo_veiculo = true;
        this.irParaCadastro();
    }

    editar(indiceLista) {
        let oVeiculo = this.oDadosVeiculos[indiceLista];
        this.oDadosApp.veiculo_atual = oVeiculo;
        
        console.log('Veiculo Editar: ', JSON.stringify(oVeiculo));

        this.oDadosControleApp.novo_veiculo = false;
        this.irParaCadastro();
    }

    irParaCadastro() {
        this.oDadosVeiculoAtual = this.oDadosApp.veiculo_atual;
        this.oNavegacao.navigate('Veiculo Cadastro');
    }
    solicitarExclusao(indice) {
        this.oDadosControleApp.config_modal = {
            exibir_modal : true,
            mensagem : 'Deseja excluir este veículo?',
            botoes : [
                {
                    texto: 'OK',
                    funcao: () => { this.excluir(indice) }
                }
            ]
        }
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        // Alert.alert(
        //     'TriSafe',
        //     'Deseja excluir este veículo?',
        //     [
        //         {
        //             text: 'Sim',
        //             style: 'default',
        //             onPress: () => { this.excluir(indice) }
        //         },
        //         {
        //             text: 'Não',
        //             style: 'cancel'
        //         },
        //     ]
        // );
    }
    excluir(indiceLista) {
        let nomeFuncao = 'excluir';

        try {            
            this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

            let metodoURI = '/veiculos/excluir/';
            
            let oVeiculo = this.oDadosVeiculos[indiceLista];
            
            console.log('Veiculo excluir: ', JSON.stringify(oVeiculo));
            
            let oDadosRequisicao = {
                veiculo: oVeiculo,
            }
            oDadosRequisicao.veiculo.cliente = this.oDadosCliente;

            this.oComunicacaoHTTP.fazerRequisicaoHTTP(metodoURI, oDadosRequisicao, (oDados, oEstado) => { this.tratarRetornoExclusao(oDados, oEstado, indiceLista) });

            this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
        } catch (oExcecao) {
            this.oUtil.tratarExcecao(oExcecao);
        }
    }

    tratarRetornoExclusao(oDados, oEstado, indiceLista) {
        let nomeFuncao = 'tratarRetornoExclusao';

        this.oRegistradorLog.registrarInicio(NOME_COMPONENTE, nomeFuncao);

        if (oEstado.ok) {
            
            //Remove o veiculo excluido da lista.
            this.oDadosVeiculos.splice(indiceLista, 1);

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
        
        this.oRegistradorLog.registrarFim(NOME_COMPONENTE, nomeFuncao);
    }

    renderItem({item, index, separators}) {

        return (
                <View style={{flexDirection:'row', borderWidth:1, borderColor: 'gainsboro', marginTop: 10}}>
                    <View style={{flexDirection:'column', justifyContent: 'center', backgroundColor: 'ghostwhite', width: '35%'}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'flex-start'}}>
                            <Text style={{margin:5, marginRight: 2, fontWeight:'bold', fontSize: 16}}>Placa:</Text>
                            <Text style={{margin:5, marginLeft: 2, fontSize: 16}}>{item.placa}</Text>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'flex-start'}}>
                            <Text style={{margin:5, marginRight: 2, fontWeight:'bold', fontSize: 16}}>Ano:</Text>
                            <Text style={{margin:5, marginLeft: 2, fontSize: 16}}>{item.ano}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', backgroundColor: 'ghostwhite', width: '45%'}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'flex-start'}}>
                            <Text style={{margin:5, marginRight: 2, fontWeight:'bold', fontSize: 16}}>Modelo:</Text>
                            <Text style={{margin:5, marginLeft: 2, fontSize: 16}}>{item.modelo}</Text>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'flex-start'}}>
                            <Text style={{margin:5, marginRight: 2, fontWeight:'bold', fontSize: 16}}>Apelido:</Text>
                            <Text style={{margin:5, marginLeft: 2, fontSize: 16}}>{item.apelido}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'column', width: '20%', alignItems:'center', borderLeftWidth:1, borderColor: 'gainsboro',}}>
                         <TouchableHighlight onPress={() => {this.editar(index)}} activeOpacity={0.6} underlayColor="#DDDDDD">
                            <View style={{flexDirection:'row', width:'100%', alignItems:'center', justifyContent:'space-evenly', marginVertical: 10}}>
                                <Icon name="edit" size={20} color="#022C18" />
                                <Text>Editar</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {this.solicitarExclusao(index)}} activeOpacity={0.6} underlayColor="#DDDDDD" >
                            <View style={{flexDirection:'row', width:'100%', alignItems:'center', justifyContent:'space-evenly', marginVertical: 10}}>
                                <Icon name="trash" size={20} color="#022C18" />
                                <Text>Excluir</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
        );
    }

    render() {
        this.oNavegacao = this.props.navigation;
        this.oDadosControleApp.novo_veiculo = false;
        let areaVeiculos = (
            <View>
                <Text>Não há veículos cadastrados.</Text>
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
                        <View style={{flexDirection:'row', justifyContent:'center'}}>
                            {this.montarIcone('car', 'Adicionar', this.adicionar, () => {}, true)}
                        </View>
                        {areaVeiculos}
                        
                        <MensagemModal />
                    </SafeAreaView>
                </ThemeProvider>
            </View>
        );
    }

    montarIcone(nomeIcone, descricao, oFuncaoOnPress, oFuncaoOnLongPress, habilitado) {
        let corIcone = '#009999';

        if(!habilitado) {
            corIcone = '#e0ebeb';
        }
        if(descricao) {
            return (
                <TouchableOpacity onPress={oFuncaoOnPress} >
                    <View style={{flexDirection:'column', width:65, marginRight:10, marginLeft:10, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={30} color={corIcone} />
                        <Text style={{color:corIcone}}>{descricao}</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={oFuncaoOnPress} onLongPress={oFuncaoOnLongPress}>
                    <View style={{flexDirection:'column', width:50, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                    </View>
                </TouchableOpacity>
            )
        }
    }
}
TelaVeiculoInicio.contextType = ContextoApp;
AreaDados.contextType = ContextoApp;