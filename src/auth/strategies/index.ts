import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.startegy';
import { YandexStrategy } from './yandex.strategy';

export const STRATEGIES = [JwtStrategy, GoogleStrategy, YandexStrategy];
