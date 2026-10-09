/**
 * v21 server adapter proposal. Declarations only; NOT a working backend adapter.
 * The standalone HTML remains local-only. Never treat a display name or the
 * preview invite fragment as an authenticated user, membership, or token.
 */
export type UUID = string & { readonly __uuid: unique symbol };
/** Calendar date, YYYY-MM-DD; not an instant and never shifted through UTC. */
export type LocalDate = string & { readonly __localDate: unique symbol };
export type ISOInstant = string & { readonly __instant: unique symbol };
export type Revision = number;

export interface AuthenticatedContext {
  /** Obtained from a verified session; server also derives this independently. */
  userId: UUID;
  coupleId: UUID;
}

export interface Collection {
  id: UUID;
  coupleId: UUID;
  title: string;
  kind: 'collection' | 'trip';
  note: string;
  createdBy: UUID;
  createdAt: ISOInstant;
  updatedAt: ISOInstant;
  revision: Revision;
}

export interface Trip {
  /** One-to-one with the collection. */
  collectionId: UUID;
  coupleId: UUID;
  startDate: LocalDate;
  endDate: LocalDate;
  /** One calendar event per whole trip, not one event per stop. */
  eventId: UUID;
}

export interface TripStop {
  id: UUID;
  collectionId: UUID;
  coupleId: UUID;
  date: LocalDate;
  /** Zero-based ordering within date. Written atomically by the server. */
  position: number;
  title: string;
  url: string | null;
  note: string;
  createdBy: UUID;
}

export type ItemReference =
  | { kind: 'dump'; id: UUID }
  | { kind: 'event'; id: UUID }
  | { kind: 'task'; id: UUID };

export interface CollectionLink {
  id: UUID;
  collectionId: UUID;
  coupleId: UUID;
  item: ItemReference;
  addedBy: UUID;
  createdAt: ISOInstant;
}

export interface CollectionSnapshot {
  collection: Collection;
  trip: Trip | null;
  stops: readonly TripStop[];
  links: readonly CollectionLink[];
}

export type AdapterErrorCode =
  | 'NOT_CONNECTED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'NETWORK'
  | 'QUOTA';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: AdapterErrorCode; message: string; currentRevision?: Revision };

export interface Mutation {
  /** UUID generated once per user action, reused for a network retry. */
  operationId: UUID;
  /** Reject stale writes; do not silently replace the partner's changes. */
  expectedRevision: Revision;
}

export interface CreateCollectionInput {
  operationId: UUID;
  title: string;
  kind: 'collection' | 'trip';
  note: string;
  trip?: { startDate: LocalDate; endDate: LocalDate };
  /** No createdBy, coupleId, participant IDs, token, or preview name input. */
}

export interface UpdateCollectionInput extends Mutation {
  id: UUID;
  title: string;
  note: string;
  trip?: { startDate: LocalDate; endDate: LocalDate };
}

export interface SaveStopInput extends Mutation {
  collectionId: UUID;
  id?: UUID;
  date: LocalDate;
  title: string;
  url: string | null;
  note: string;
}

export interface ChangeHint {
  collectionId: UUID;
  /** Only an invalidation hint. Refetch through authenticated reads. */
  revision: Revision;
}

/** The connected implementation is future work; v21 HTML does not instantiate it. */
export interface SharedCollectionAdapter {
  readonly mode: 'connected';
  currentContext(): Promise<Result<AuthenticatedContext>>;
  listCollections(): Promise<Result<readonly Collection[]>>;
  getCollection(id: UUID): Promise<Result<CollectionSnapshot>>;
  createCollection(input: CreateCollectionInput): Promise<Result<CollectionSnapshot>>;
  /** Dates and the linked event must commit or fail together. */
  updateCollection(input: UpdateCollectionInput): Promise<Result<CollectionSnapshot>>;
  /** Deleting the collection unlinks existing content; does not erase dumps/tasks. */
  deleteCollection(id: UUID, mutation: Mutation): Promise<Result<void>>;
  saveStop(input: SaveStopInput): Promise<Result<CollectionSnapshot>>;
  deleteStop(collectionId: UUID, stopId: UUID, mutation: Mutation): Promise<Result<CollectionSnapshot>>;
  /** orderedIds must be exactly the stops of this date, without duplicates. */
  reorderStops(collectionId: UUID, date: LocalDate, orderedIds: readonly UUID[], mutation: Mutation): Promise<Result<CollectionSnapshot>>;
  /** v21 allows one collection per item. Moving requires explicit replacement. */
  linkItem(collectionId: UUID, item: ItemReference, mutation: Mutation): Promise<Result<CollectionSnapshot>>;
  unlinkItem(collectionId: UUID, item: ItemReference, mutation: Mutation): Promise<Result<CollectionSnapshot>>;
  /** Cancellation must unsubscribe and release the channel. */
  subscribe(onChange: (hint: ChangeHint) => void): Promise<Result<() => void>>;
}

/** Separate future scope; no fake messages, connected badges, or unread counts. */
export interface FutureConversationRequirements {
  singleCoupleThread: true;
  authenticatedSenderOnly: true;
  serverIssuedMessageOrder: true;
  idempotentSend: true;
  reconnectBackfill: true;
  /** Mark seen only when the specific message is visible and the app is active. */
  viewportBasedReadReceipt: true;
  monotonicReadCursor: true;
  privateAttachmentAuthorization: true;
  offlineRetryVisible: true;
  /** Typing/presence is ephemeral and is not proof that a message was read. */
  ephemeralPresenceOnly: true;
}
