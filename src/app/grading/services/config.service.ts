import { BreakpointObserver } from "@angular/cdk/layout";
import { inject, Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private breakpointObserver = inject(BreakpointObserver);

    questionSidebarOpen = signal(false)
    screenWidth = signal<number>(window.innerWidth);

    constructor() {
        this.breakpointObserver
            .observe('(min-width: 1536px)')
            .subscribe(() => {
                const width = window.innerWidth;
                width > 1536 ? this.questionSidebarOpen.set(true) : this.questionSidebarOpen.set(false)
                this.screenWidth.set(width);
            });
    }
}