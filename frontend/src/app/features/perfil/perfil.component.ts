import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  senhaForm: FormGroup;
  saving = signal(false);
  savingPassword = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.perfilForm = this.fb.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      telefone: [''],
      veiculoMarca: [''],
      veiculoModelo: [''],
      veiculoPlaca: ['']
    });

    this.senhaForm = this.fb.group({
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.perfilForm.patchValue({
        nome: user.nome,
        sobrenome: user.sobrenome,
        telefone: user.telefone || '',
        veiculoMarca: user.veiculoMarca || '',
        veiculoModelo: user.veiculoModelo || '',
        veiculoPlaca: user.veiculoPlaca || ''
      });
    }
  }

  savePerfil(): void {
    if (this.perfilForm.invalid) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.authService.updatePerfil(this.perfilForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set('Perfil atualizado com sucesso!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Erro ao atualizar perfil.');
      }
    });
  }

  savePassword(): void {
    if (this.senhaForm.invalid) return;
    this.savingPassword.set(true);

    this.authService.changePassword(this.senhaForm.value.novaSenha).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.senhaForm.reset();
        this.successMsg.set('Senha alterada com sucesso!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.savingPassword.set(false);
        this.errorMsg.set('Erro ao alterar senha.');
      }
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const nova = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    return nova === confirmar ? null : { passwordMismatch: true };
  }

  get user() { return this.authService.currentUser(); }
}
