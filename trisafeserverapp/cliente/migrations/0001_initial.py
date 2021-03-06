# Generated by Django 2.2.14 on 2020-09-16 23:05

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id_cliente_iter', models.IntegerField(primary_key=True, serialize=False)),
                ('nome', models.CharField(max_length=70)),
                ('nome_usuario', models.CharField(max_length=20, null=True)),
                ('cpf', models.CharField(max_length=11, null=True)),
                ('rg', models.CharField(max_length=10, null=True)),
                ('rua', models.CharField(max_length=200, null=True)),
                ('numero', models.IntegerField()),
                ('complemento', models.CharField(max_length=30, null=True)),
                ('cep', models.CharField(max_length=11, null=True)),
                ('bairro', models.CharField(max_length=200, null=True)),
                ('cidade', models.CharField(max_length=200, null=True)),
                ('uf', models.CharField(max_length=11, null=True)),
                ('telefone', models.CharField(max_length=11, null=True)),
                ('email', models.EmailField(max_length=254)),
                ('senha', models.CharField(max_length=20, null=True)),
                ('dt_hr_inclusao', models.DateTimeField(auto_now_add=True)),
                ('ult_atualizacao', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
