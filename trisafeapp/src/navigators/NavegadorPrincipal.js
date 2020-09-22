'use strict';
import React from 'react';
//import * as React from 'react';
//import { View, Text } from 'react-native';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TelaClienteInicio from '../screens/TelaClienteInicio';
import TelaModalTestesCadastro from '../tests/TelaModalTestesCadastro';
import TelaClienteDadosPessoais from '../screens/TelaClienteDadosPessoais';
import TelaClienteEndereco from '../screens/TelaClienteEndereco';
import TelaClienteConfirmacao from '../screens/TelaClienteConfirmacao';
import TelaCapturaFotoCNH from '../screens/TelaCapturaFotoCNH';
import TelaBoletoEmissao from '../screens/TelaBoletoEmissao';
import TelaMenuInicio from '../screens/TelaMenuInicio';
import { ContextoAppProvider } from '../contexts/ContextoApp';
import TelaModalVisualizaFotoCNH from '../screens/TelaModalVisualizaFotoCNH';
import TelaModalContratoAceite from '../screens/TelaContratoClicksign';

//const Stack = createStackNavigator();

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
        <fluxoCadastro.Screen name="Foto CNH" component={TelaCapturaFotoCNH} />
        <fluxoCadastro.Screen name="Contrato" component={TelaModalContratoAceite} />
        <fluxoCadastro.Screen name="Boleto" component={TelaBoletoEmissao} />
    </fluxoCadastro.Navigator>
  );
}

function FluxoModais() {
  return (
    <fluxoModais.Navigator headerMode='none' initialRouteName='Testes Cadastro'>
        <fluxoModais.Screen name="Testes Cadastro" component={TelaModalTestesCadastro} />
        <fluxoModais.Screen name="Visualizacao Foto CNH" component={TelaModalVisualizaFotoCNH} />
        <fluxoModais.Screen name="Cadastro Cliente" component={FluxoCadastro} />
    </fluxoModais.Navigator>
  );
}

function FluxoRaiz() {
  
  return (
    <fluxoRaiz.Navigator headerMode='none' mode='modal' initialRouteName='Menu'>
        <fluxoRaiz.Screen name="Menu" component={TelaMenuInicio} />
        <fluxoRaiz.Screen name="Cadastro Cliente" component={FluxoCadastro} />
        <fluxoRaiz.Screen name="Testes Cadastro" component={FluxoModais} />
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