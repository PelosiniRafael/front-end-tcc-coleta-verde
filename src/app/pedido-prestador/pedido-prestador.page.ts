import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColetaBackendService } from 'src/app/services/coleta-backend.service';
import { NavController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-pedido-prestador',
  templateUrl: './pedido-prestador.page.html',
  styleUrls: ['./pedido-prestador.page.scss'],
  standalone: false,
})
export class PedidoPrestadorPage implements OnInit {

  solicitationId!: number;
  solicitacao: any;
  nomeCliente: string = '...';

 constructor(
  private route: ActivatedRoute,
  private coletaService: ColetaBackendService,
  private toastCtrl: ToastController,
  private navCtrl: NavController,
  private router: Router // Adicione esta linha
) {}


  ngOnInit() {}
  
  ionViewWillEnter() {
    this.solicitationId = Number(this.route.snapshot.paramMap.get('id'));
    this.buscarSolicitacao();
  }

  buscarSolicitacao() {
    this.coletaService.buscarSolicitacaoPorId(this.solicitationId).subscribe({
      next: (res) => {
        this.solicitacao = res.data;

        const authorId = this.solicitacao.authorId;
        if (authorId) {
          this.coletaService.getUsuarioPorId(authorId).subscribe({
            next: (userRes) => {
              const user = (userRes as any).data;
              this.nomeCliente = user.name;
            },
            error: () => {
              this.nomeCliente = 'Nome indisponível';
            }
          });
        }
      },
      error: () => {
        this.showErro('Erro ao carregar os detalhes do pedido');
      }
    });
  }

  async aceitarSolicitacao() {
    this.coletaService.aceitarSolicitacao(this.solicitacao.id).subscribe({
      next: async (res) => {
        console.log('ID da solicitação:', this.solicitacao.id);
        if (res.status === 200) {
          const toast = await this.toastCtrl.create({
            message: 'Solicitação aceita com sucesso!',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.navCtrl.navigateRoot('/pedidos-prestador');
        } else {
          this.showErro(res.message ?? 'Erro ao aceitar a solicitação');
        }
      },
      error: () => {
        this.showErro('Erro de conexão com o servidor');
      }
    });
  }

  // Adicione este método para finalizar a solicitação
 async finalizarPedido() {
  this.coletaService.finalizarSolicitacao(this.solicitacao.id).subscribe({
    next: async (res: any) => {
      if (res.status === 200) {
        const toast = await this.toastCtrl.create({
          message: 'Pedido finalizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/pedidos-prestador']);
      } else {
        this.showErro(res.message ?? 'Erro ao finalizar o pedido');
      }
    },
    error: (err: any) => {
      console.error('Erro ao finalizar pedido:', err);
      this.showErro('Erro de conexão com o servidor');
    }
  });
}


  async showErro(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }

  tipoColetaMap: { [key: number]: string } = {
    0: 'Reciclável',
    1: 'Entulho',
    2: 'Orgânico',
    3: 'Eletrônico'
  };
}
