import { computed, inject, Injectable, signal } from "@angular/core";
import { Page, Store, Strokes } from "../model/store.mode";
import { HotToastService } from "@ngxpert/hot-toast";

@Injectable({ providedIn: 'root' })
export class DrawingAndWritingStore {
    private _store = signal<Store>(new Store());
    private _toast = inject(HotToastService)

    store = computed(() => this._store());

    constructor() {
        this.createNewPage();
    }

    createStore() {
        this._store.set(new Store())
        this.createNewPage()
    }

    getStoreData(): Store {
        return this._store();
    }

    updateStore(update: Partial<Store>) {
        this._store.update(store => ({
            ...store,
            ...update
        }))
    }

    updateStoreCurrentPage(currentPage: number) {
        const store = this._store();

        if (currentPage >= 0 && currentPage < store.pages.length) {
            this._store.update(s => ({ ...s, currentPage }));
        }
    }

    getCurrentPageData(): Page {
        const store = this._store();
        return store.pages[store.currentPage];
    }

    createNewPage(): Promise<void> {
        return new Promise(resolve => {
            this._store.update(store => {
                const newPageNumber = store.pages.length + 1;
                const newPage = new Page(newPageNumber);

                const updatedPages = [...store.pages, newPage];
                const newCurrentPage = updatedPages.length - 1;

                return {
                    ...store,
                    currentPage: newCurrentPage,
                    pages: updatedPages
                };
            });

            resolve();
        });
    }

    selectPage(pageIndex: number) {
        this.updateStoreCurrentPage(pageIndex);
    }

    clearCurrentPage() {
        this._store.update(store => {
            const updatedPages = store.pages.map((page, i) => {
                if (i === store.currentPage) {
                    return { ...page, strokes: [] };
                }

                return page;
            });

            return { ...store, pages: updatedPages };
        });
    }

    updateCurrentPageStrokes(strokes: Strokes[]) {
        this._store.update(store => {
            const updatedPages = store.pages.map((page, i) => {
                if (i === store.currentPage) {
                    return { ...page, strokes: [...strokes] };
                }

                return page;
            });

            return {
                ...store,
                pages: updatedPages,
            };
        });
    }

    clearStoreData() {
        const newStore = new Store();

        this._store.set(newStore);
    }
}