'use strict';
import React from 'react';
//import * as React from 'react';
//import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TelaClienteInicio from '../screens/TelaClienteInicio';
import TelaTestesInicio from '../tests/TelaTestesInicio';
import TelaClienteDadosPessoais from '../screens/TelaClienteDadosPessoais';
import TelaClienteEndereco from '../screens/TelaClienteEndereco';
import TelaClienteConfirmacao from '../screens/TelaClienteConfirmacao';
import TelaFotoCNH from '../screens/TelaFotoCNH';
import TelaContratoAceite from '../screens/TelaContratoAceite';
import TelaBoletoEmissao from '../screens/TelaBoletoEmissao';
import TelaMenuInicio from '../screens/TelaMenuInicio';
import TelaVeiculoInicio from '../screens/TelaVeiculoInicio';
import { ContextoAppProvider } from '../contexts/ContextoApp';

const Stack = createStackNavigator();

function Cadastro() {
  return (
    <Stack.Navigator headerMode='none'>
        <Stack.Screen name="Menu" component={TelaMenuInicio} />
        <Stack.Screen name="Cadastro" component={TelaClienteInicio} />
        <Stack.Screen name="Testes" component={TelaTestesInicio} />
        <Stack.Screen name="Dados pessoais" component={TelaClienteDadosPessoais} />
        <Stack.Screen name="Endereço" component={TelaClienteEndereco} />
        <Stack.Screen name="Confirmação dos dados" component={TelaClienteConfirmacao} />
        <Stack.Screen name="Foto CNH" component={TelaFotoCNH} />
        <Stack.Screen name="Contrato" component={TelaContratoAceite} />
        <Stack.Screen name="Boleto" component={TelaBoletoEmissao} />
        <Stack.Screen name="Veiculo Inicio" component={TelaVeiculoInicio} />
    </Stack.Navigator>
  );
}

function TestesMeuCadastro() {
  return (
    <Stack.Navigator headerMode='none'>
        <Stack.Screen name="Testes" component={TelaTestesInicio} />
        <Stack.Screen name="Cadastro" component={TelaClienteInicio} />        
        <Stack.Screen name="Dados pessoais" component={TelaClienteDadosPessoais} />
        <Stack.Screen name="Endereço" component={TelaClienteEndereco} />
        <Stack.Screen name="Confirmação dos dados" component={TelaClienteConfirmacao} />
        <Stack.Screen name="Foto CNH" component={TelaFotoCNH} />
        <Stack.Screen name="Contrato" component={TelaContratoAceite} />
        <Stack.Screen name="Boleto" component={TelaBoletoEmissao} />
        <Stack.Screen name="Veiculo Inicio" component={TelaVeiculoInicio} />
    </Stack.Navigator>
  );
}

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Meu Cadastro" component={Cadastro} />
      <Drawer.Screen name="Testes Inicio" component={TestesMeuCadastro} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <ContextoAppProvider>
      <NavigationContainer>
        <MyDrawer />
      </NavigationContainer>
    </ContextoAppProvider>
  );
}