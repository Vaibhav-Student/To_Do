import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

/**
 * Component to show task count for each list
 * Displays the number of active (non-completed) tasks
 */
function ListTaskCount({ listId }) {
    const tasks = useLiveQuery(
        () => db.tasks.where('listId').equals(listId).toArray(),
        [listId]
    ) || [];

    const activeCount = tasks.filter(t => !t.completed).length;

    return <span className="list-count">{activeCount} active</span>;
}

export default ListTaskCount;
