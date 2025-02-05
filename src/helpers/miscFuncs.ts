import { AutoCompleteCompleteEvent } from "primevue/autocomplete";

export const filterArray = (event:AutoCompleteCompleteEvent ,array: BaseOption[]): string[] => {
    return event.query ? array.filter((item) => {
        return item.name.toLowerCase().includes(event.query.toLowerCase());
    }).map((item)=>item.name): array.map((item)=>item.name);
}