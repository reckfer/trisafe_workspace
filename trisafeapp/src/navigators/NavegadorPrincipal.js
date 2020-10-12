'use strict';
import React from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TelaClienteInicio from '../screens/TelaClienteInicio';
import TelaModalTestesCadastro from '../tests/TelaModalTestesCadastro';
import TelaClienteDadosPessoais from '../screens/TelaClienteDadosPessoais';
import TelaClienteEndereco from '../screens/TelaClienteEndereco';
import TelaClienteConfirmacao from '../screens/TelaClienteConfirmacao';
import TelaCapturaFoto from '../screens/TelaCapturaFoto';
import TelaModalBoleto from '../screens/TelaModalBoleto';
import TelaMenuInicio from '../screens/TelaMenuInicio';
import { ContextoAppProvider } from '../contexts/ContextoApp';
import TelaModalVisualizaFoto from '../screens/TelaModalVisualizaFoto';
import TelaVeiculoInicio from '../screens/TelaVeiculoInicio';
import TelaVeiculoCadastro from '../screens/TelaVeiculoCadastro';
import TelaContratacaoPrincipal from '../screens/TelaContratacaoPrincipal';
import TelaModalContratoClicksign from '../screens/TelaModalContratoClicksign';

const fluxoRaiz = createDrawerNavigator();
const fluxoModais = createStackNavigator();
const fluxoCadastro = createStackNavigator();

function FluxoCadastro() {
  return (
    <fluxoCadastro.Navigator headerMode='none'>
        <fluxoCadastro.Screen name="Cadastro" component={TelaClienteInicio} />
        <fluxoCadastro.Screen name="Dados pessoais" component={TelaClienteDadosPessoais} />
        <fluxoCadastro.Screen name="Endereco" component={TelaClienteEndereco} />
        <fluxoCadastro.Screen name="Confirmação dos dados" component={TelaClienteConfirmacao} />
        <fluxoCadastro.Screen name="Captura Foto" component={TelaCapturaFoto} />
        <fluxoCadastro.Screen name="Veiculo Inicio" component={TelaVeiculoInicio} />
        <fluxoCadastro.Screen name="Veiculo Cadastro" component={TelaVeiculoCadastro} />
        <fluxoCadastro.Screen name="Contratacao" component={TelaContratacaoPrincipal} />
    </fluxoCadastro.Navigator>
  );
}

function FluxoModais() {
  return (
    <fluxoModais.Navigator headerMode='none' initialRouteName='Testes Cadastro'>
        <fluxoModais.Screen name="Visualizacao Foto" component={TelaModalVisualizaFoto} />
        <fluxoModais.Screen name="Contrato Clicksign" component={TelaModalContratoClicksign} />
        <fluxoModais.Screen name="Boleto Gerencianet" component={TelaModalBoleto} />
        <fluxoModais.Screen name="Fluxo Cadastro Cliente" component={FluxoCadastro} />
        <fluxoModais.Screen name="Testes Cadastro" component={TelaModalTestesCadastro} />
    </fluxoModais.Navigator>
  );
}

function FluxoRaiz() {
  
  return (
    <fluxoRaiz.Navigator headerMode='none' mode='modal' initialRouteName='Menu'>
        <fluxoRaiz.Screen name="Menu" component={TelaMenuInicio} />
        <fluxoRaiz.Screen name="Fluxo Cadastro Cliente" component={FluxoCadastro} />
        <fluxoRaiz.Screen name="Fluxo Modais" component={FluxoModais} />
    </fluxoRaiz.Navigator>
  );
}

export default function App() {
  
  return (
    <ContextoAppProvider>
      <NavigationContainer>
        <FluxoRaiz />
      </NavigationContainer>
    </ContextoAppProvider>
  );
}