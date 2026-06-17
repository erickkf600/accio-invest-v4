import { HttpContextToken } from '@angular/common/http';

export const HAS_LOADING = new HttpContextToken<boolean>(() => true);
