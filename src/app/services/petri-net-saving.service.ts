import { inject, Injectable } from '@angular/core';
import { SourcePetriNetService } from './source-petri-net.service';
import { ToasterNotificationService } from './toaster-notification.service';
import { Diagram } from '../classes/diagram/diagram';
import { SerializationService } from './serialization.service';
import { SavingService } from './saving.service';

@Injectable({ providedIn: 'root' })
export class PetriNetSavingService extends SavingService {
    private _sourcePetriNetService = inject(SourcePetriNetService);
    private _notificationService = inject(ToasterNotificationService);
    private _serializationService = inject(SerializationService);

    private readonly DEFAULT_FILE_NAME = 'petri-net';

    /**
     * Saves the current Petri net by triggering a download of the source text as a file.
     * If no Petri net is present, a warning notification is shown.
     */
    public savePetriNet(format: 'json' | 'pnml' = 'json'): void {
        const isDirty = this._sourcePetriNetService.isCurrentNetDirty();
        let textContent: string;
        let diagramToSave: Diagram | null;
        const fileName = `${this.DEFAULT_FILE_NAME}.${format}`;

        if (isDirty) {
            diagramToSave = this._sourcePetriNetService.getCurrentSourceNet();
            if (!diagramToSave) return;

            textContent = this._serializationService.serialize(diagramToSave, format);
            this._sourcePetriNetService.setClean(textContent, diagramToSave);
        } else {
            const sourceText = this._sourcePetriNetService.getSourceText();
            const diagram = this._sourcePetriNetService.getCurrentSourceNet();
            if (diagram && this.detectFormat(sourceText) !== format) {
                textContent = this._serializationService.serialize(diagram, format);
            } else {
                textContent = sourceText;
            }
        }

        if (!textContent) {
            this._notificationService.showWarning('TOASTER.HEADER.SAVE_IMPOSSIBLE', 'TOASTER.BODY.NO_NET_TO_SAVE');
            return;
        }
        this.triggerDownload(textContent, fileName);
    }

    private detectFormat(text: string): 'json' | 'pnml' {
        const trimmedText = text.trim();
        if (trimmedText.startsWith('<?xml') || trimmedText.startsWith('<pnml')) {
            return 'pnml';
        }
        return 'json';
    }
}
