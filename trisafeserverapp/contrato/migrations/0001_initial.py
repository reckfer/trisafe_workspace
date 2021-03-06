# Generated by Django 2.2.14 on 2020-09-16 23:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cliente', '0001_initial'),
        ('produto', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contrato',
            fields=[
                ('id_contrato', models.CharField(max_length=30, primary_key=True, serialize=False)),
                ('valor_total', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('aceito', models.BooleanField(default=False)),
                ('dt_hr_inclusao', models.DateTimeField(auto_now_add=True)),
                ('ult_atualizacao', models.DateTimeField(auto_now=True)),
                ('chave_contrato_ext', models.CharField(max_length=100, null=True)),
                ('chave_boleto_ext', models.CharField(max_length=100, null=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cliente.Cliente')),
                ('produtos_contratados', models.ManyToManyField(to='produto.Produto')),
            ],
        ),
    ]
