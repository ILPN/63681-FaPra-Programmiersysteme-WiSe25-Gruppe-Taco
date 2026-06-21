import { SavingService } from './saving.service';
import { inject, Injectable } from '@angular/core';
import { TabStateService } from './tab-state.service';
import { SerializationService } from './serialization.service';
import { Tab } from '../classes/tabs';
import { Diagram } from '../classes/diagram/diagram';
import { ReachabilityGraphService } from '../reachability-graph.service';
import { DiagramPlace } from '../classes/diagram/diagram-place';
import { DiagramTransition } from '../classes/diagram/diagram-transition';
import { DiagramArc } from '../classes/diagram/diagram-arc';

@Injectable({ providedIn: 'root' })
export class ReachabilityGraphSavingService extends SavingService {
    private _tabsStateService = inject(TabStateService);
    private _reachabilityGraphService = inject(ReachabilityGraphService);
    private _serialisationService = inject(SerializationService);

    private readonly DEFAULT_FILE_NAME = 'reachability-graph';

    public saveReachabilityGraphAsPetriNet(format: 'json' | 'pnml' = 'json'): void {
        if (this._tabsStateService.currentTab() !== Tab.REACHABILITY_GRAPH) {
            return;
        }

        const pn = this.convertRGtoPN();
        const fileName = `${this.DEFAULT_FILE_NAME}.${format}`;
        this.triggerDownload(this._serialisationService.serialize(pn, format), fileName);
    }

    private convertRGtoPN(): Diagram {
        const rg = this._reachabilityGraphService.showingCompleteGraph()
            ? this._reachabilityGraphService.completeReachabilityGraph()
            : this._reachabilityGraphService.reachabilityGraphSignal();

        let counter = 0;

        // generate all places
        const places = new Map<string, DiagramPlace>();
        for (const s of rg.nodes) {
            places.set(s.id, new DiagramPlace(`p${counter++}`, s.isStartingState ? 1 : 0));
        }
        counter = 0;

        // generate all transitions and arcs
        const transitions: DiagramTransition[] = [];
        const arcs: DiagramArc[] = [];
        let aCounter = 0;
        for (const t of rg.edges) {
            const inP = places.get(t.source);
            if (inP === undefined) {
                throw new Error('Cannot resolve state transition source');
            }
            const outP = places.get(t.target);
            if (outP === undefined) {
                throw new Error('Cannot resolve state transition target');
            }
            const tid = `t${counter++}`;

            const inA = new DiagramArc(`a${aCounter++}`, inP.id, tid);
            const outA = new DiagramArc(`a${aCounter++}`, tid, outP.id);

            transitions.push(new DiagramTransition(tid, t.displayLabel, [inP], [outP], [inA], [outA]));
            arcs.push(inA, outA);
        }

        return new Diagram([...places.values()], transitions, arcs);
    }
}
