import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'zeroPad',
})
export class ZeroPadPipe implements PipeTransform {
    transform(value: number, length: number = 6): unknown {
        return value.toString().padStart(length, '0');
    }
}
