/**
 * OS Configuration Editor
 * Edit OSEK/AUTOSAR OS configuration including Tasks, Events, Alarms, Resources, Counters, ISRs
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'
import type { OSConfig, OSTask, OSEvent, OSAlarm, OSResource, OSCounter, OSISR } from '@/types/config'
import {
  Plus,
  Trash2,
  Settings,
  Cpu,
  Bell,
  Lock,
  Timer,
  Zap,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react'

interface OSEditorProps {
  className?: string
}

type OSTab = 'general' | 'tasks' | 'events' | 'alarms' | 'resources' | 'counters' | 'isrs'

export function OSEditor({ className }: OSEditorProps) {
  const { currentConfig, updateOS } = useConfigStore()
  const [activeTab, setActiveTab] = useState<OSTab>('tasks')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const os = currentConfig?.os
  if (!os) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-gray-500">No OS configuration found</p>
      </div>
    )
  }

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedItems(newSet)
  }

  const tabs = [
    { id: 'general' as OSTab, label: 'General', icon: Settings },
    { id: 'tasks' as OSTab, label: 'Tasks', icon: Cpu, count: os.tasks.length },
    { id: 'events' as OSTab, label: 'Events', icon: Bell, count: os.events.length },
    { id: 'alarms' as OSTab, label: 'Alarms', icon: Timer, count: os.alarms.length },
    { id: 'resources' as OSTab, label: 'Resources', icon: Lock, count: os.resources.length },
    { id: 'counters' as OSTab, label: 'Counters', icon: GripVertical, count: os.counters.length },
    { id: 'isrs' as OSTab, label: 'ISRs', icon: Zap, count: os.isrs.length },
  ]

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{os.name}</h2>
            <p className="text-sm text-gray-500">OS Version {os.version} • {os.scalabilityClass}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              os.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            )}>
              {os.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'general' && <GeneralEditor os={os} onUpdate={updateOS} />}
        {activeTab === 'tasks' && <TasksEditor tasks={os.tasks} onUpdate={(tasks) => updateOS({ ...os, tasks })} />}
        {activeTab === 'events' && <EventsEditor events={os.events} onUpdate={(events) => updateOS({ ...os, events })} />}
        {activeTab === 'alarms' && <AlarmsEditor alarms={os.alarms} tasks={os.tasks} events={os.events} counters={os.counters} onUpdate={(alarms) => updateOS({ ...os, alarms })} />}
        {activeTab === 'resources' && <ResourcesEditor resources={os.resources} onUpdate={(resources) => updateOS({ ...os, resources })} />}
        {activeTab === 'counters' && <CountersEditor counters={os.counters} onUpdate={(counters) => updateOS({ ...os, counters })} />}
        {activeTab === 'isrs' && <ISRsEditor isrs={os.isrs} resources={os.resources} onUpdate={(isrs) => updateOS({ ...os, isrs })} />}
      </div>
    </div>
  )
}

// General OS Settings Editor
function GeneralEditor({ os, onUpdate }: { os: OSConfig; onUpdate: (os: OSConfig) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OS Name</label>
          <input
            type="text"
            value={os.name}
            onChange={(e) => onUpdate({ ...os, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
          <input
            type="text"
            value={os.version}
            onChange={(e) => onUpdate({ ...os, version: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scalability Class</label>
          <select
            value={os.scalabilityClass}
            onChange={(e) => onUpdate({ ...os, scalabilityClass: e.target.value as OSConfig['scalabilityClass'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="SC1">SC1 (Single Core, No Hooks)</option>
            <option value="SC2">SC2 (Single Core, With Hooks)</option>
            <option value="SC3">SC3 (Multi Core, No Hooks)</option>
            <option value="SC4">SC4 (Multi Core, With Hooks)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Level</label>
          <select
            value={os.statusLevel}
            onChange={(e) => onUpdate({ ...os, statusLevel: e.target.value as OSConfig['statusLevel'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="STANDARD">STANDARD</option>
            <option value="EXTENDED">EXTENDED</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Hooks Configuration</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'startupHooks', label: 'Startup Hooks' },
            { key: 'shutdownHooks', label: 'Shutdown Hooks' },
            { key: 'errorHooks', label: 'Error Hooks' },
            { key: 'protectionHooks', label: 'Protection Hooks' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={os[key as keyof OSConfig] as boolean}
                onChange={(e) => onUpdate({ ...os, [key]: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Tasks Editor
function TasksEditor({ tasks, onUpdate }: { tasks: OSTask[]; onUpdate: (tasks: OSTask[]) => void }) {
  const addTask = () => {
    const newTask: OSTask = {
      id: `task-${Date.now()}`,
      name: `New_Task_${tasks.length + 1}`,
      priority: 5,
      schedule: 'FULL',
      activation: 1,
      autostart: false,
      resources: [],
      events: [],
      stackSize: 512,
    }
    onUpdate([...tasks, newTask])
  }

  const updateTask = (index: number, updates: Partial<OSTask>) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], ...updates }
    onUpdate(newTasks)
  }

  const removeTask = (index: number) => {
    onUpdate(tasks.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Tasks ({tasks.length})</h3>
        <button
          onClick={addTask}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={(updates) => updateTask(index, updates)}
            onRemove={() => removeTask(index)}
          />
        ))}
      </div>
    </div>
  )
}

function TaskItem({ task, onUpdate, onRemove }: { task: OSTask; onUpdate: (updates: Partial<OSTask>) => void; onRemove: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <span className="font-medium text-sm">{task.name}</span>
          <span className="text-xs text-gray-500">Priority: {task.priority}</span>
          {task.autostart && (
            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">Auto</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={task.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority (1-255)</label>
              <input
                type="number"
                min={1}
                max={255}
                value={task.priority}
                onChange={(e) => onUpdate({ priority: parseInt(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Schedule</label>
              <select
                value={task.schedule}
                onChange={(e) => onUpdate({ schedule: e.target.value as 'NON' | 'FULL' })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              >
                <option value="NON">NON (Non-preemptive)</option>
                <option value="FULL">FULL (Preemptive)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stack Size (bytes)</label>
              <input
                type="number"
                value={task.stackSize}
                onChange={(e) => onUpdate({ stackSize: parseInt(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.autostart}
                onChange={(e) => onUpdate({ autostart: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Autostart</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={task.activation}
                onChange={(e) => onUpdate({ activation: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span className="text-sm">Activation Count</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// Events Editor
function EventsEditor({ events, onUpdate }: { events: OSEvent[]; onUpdate: (events: OSEvent[]) => void }) {
  const addEvent = () => {
    const newEvent: OSEvent = {
      id: `evt-${Date.now()}`,
      name: `Event_${events.length + 1}`,
      mask: `0x${(1 << events.length).toString(16).padStart(2, '0')}`,
    }
    onUpdate([...events, newEvent])
  }

  const updateEvent = (index: number, updates: Partial<OSEvent>) => {
    const newEvents = [...events]
    newEvents[index] = { ...newEvents[index], ...updates }
    onUpdate(newEvents)
  }

  const removeEvent = (index: number) => {
    onUpdate(events.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Events ({events.length})</h3>
        <button
          onClick={addEvent}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid gap-2">
        {events.map((event, index) => (
          <div key={event.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={event.name}
              onChange={(e) => updateEvent(index, { name: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="Event name"
            />
            <input
              type="text"
              value={event.mask}
              onChange={(e) => updateEvent(index, { mask: e.target.value })}
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded font-mono"
              placeholder="0x01"
            />
            <button
              onClick={() => removeEvent(index)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Resources Editor
function ResourcesEditor({ resources, onUpdate }: { resources: OSResource[]; onUpdate: (resources: OSResource[]) => void }) {
  const addResource = () => {
    const newResource: OSResource = {
      id: `res-${Date.now()}`,
      name: `Resource_${resources.length + 1}`,
      linkedResources: [],
    }
    onUpdate([...resources, newResource])
  }

  const updateResource = (index: number, updates: Partial<OSResource>) => {
    const newResources = [...resources]
    newResources[index] = { ...newResources[index], ...updates }
    onUpdate(newResources)
  }

  const removeResource = (index: number) => {
    onUpdate(resources.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Resources ({resources.length})</h3>
        <button
          onClick={addResource}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      <div className="grid gap-2">
        {resources.map((resource, index) => (
          <div key={resource.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={resource.name}
              onChange={(e) => updateResource(index, { name: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="Resource name"
            />
            <button
              onClick={() => removeResource(index)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Counters Editor
function CountersEditor({ counters, onUpdate }: { counters: OSCounter[]; onUpdate: (counters: OSCounter[]) => void }) {
  const addCounter = () => {
    const newCounter: OSCounter = {
      id: `cnt-${Date.now()}`,
      name: `Counter_${counters.length + 1}`,
      maxAllowedValue: 4294967295,
      ticksPerBase: 1,
      minCycle: 1,
    }
    onUpdate([...counters, newCounter])
  }

  const updateCounter = (index: number, updates: Partial<OSCounter>) => {
    const newCounters = [...counters]
    newCounters[index] = { ...newCounters[index], ...updates }
    onUpdate(newCounters)
  }

  const removeCounter = (index: number) => {
    onUpdate(counters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Counters ({counters.length})</h3>
        <button
          onClick={addCounter}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Counter
        </button>
      </div>

      <div className="space-y-2">
        {counters.map((counter, index) => (
          <div key={counter.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={counter.name}
                onChange={(e) => updateCounter(index, { name: e.target.value })}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Counter name"
              />
              <button
                onClick={() => removeCounter(index)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Value</label>
                <input
                  type="number"
                  value={counter.maxAllowedValue}
                  onChange={(e) => updateCounter(index, { maxAllowedValue: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ticks/Base</label>
                <input
                  type="number"
                  value={counter.ticksPerBase}
                  onChange={(e) => updateCounter(index, { ticksPerBase: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Cycle</label>
                <input
                  type="number"
                  value={counter.minCycle}
                  onChange={(e) => updateCounter(index, { minCycle: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Alarms Editor
function AlarmsEditor({ alarms, tasks, events, counters, onUpdate }: { 
  alarms: OSAlarm[]; 
  tasks: OSTask[]; 
  events: OSEvent[]; 
  counters: OSCounter[];
  onUpdate: (alarms: OSAlarm[]) => void;
}) {
  const addAlarm = () => {
    const newAlarm: OSAlarm = {
      id: `alarm-${Date.now()}`,
      name: `Alarm_${alarms.length + 1}`,
      counter: counters[0]?.name || 'SystemCounter',
      autostart: false,
      period: 100,
      action: 'ACTIVATETASK',
      task: tasks[0]?.name || '',
    }
    onUpdate([...alarms, newAlarm])
  }

  const updateAlarm = (index: number, updates: Partial<OSAlarm>) => {
    const newAlarms = [...alarms]
    newAlarms[index] = { ...newAlarms[index], ...updates }
    onUpdate(newAlarms)
  }

  const removeAlarm = (index: number) => {
    onUpdate(alarms.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Alarms ({alarms.length})</h3>
        <button
          onClick={addAlarm}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Alarm
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alarms.map((alarm, index) => (
          <div key={alarm.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={alarm.name}
                onChange={(e) => updateAlarm(index, { name: e.target.value })}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="Alarm name"
              />
              <button
                onClick={() => removeAlarm(index)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Counter</label>
                <select
                  value={alarm.counter}
                  onChange={(e) => updateAlarm(index, { counter: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  {counters.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Action</label>
                <select
                  value={alarm.action}
                  onChange={(e) => updateAlarm(index, { action: e.target.value as OSAlarm['action'] })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="ACTIVATETASK">Activate Task</option>
                  <option value="SETEVENT">Set Event</option>
                  <option value="CALLBACK">Callback</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {alarm.action !== 'ALARMCALLBACK' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Target Task</label>
                  <select
                    value={alarm.task}
                    onChange={(e) => updateAlarm(index, { task: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {alarm.action === 'SETEVENT' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Event</label>
                  <select
                    value={alarm.event || ''}
                    onChange={(e) => updateAlarm(index, { event: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alarm.autostart}
                  onChange={(e) => updateAlarm(index, { autostart: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Autostart</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Period:</span>
                <input
                  type="number"
                  value={alarm.period}
                  onChange={(e) => updateAlarm(index, { period: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-xs text-gray-500">ticks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ISRs Editor
function ISRsEditor({ isrs, resources, onUpdate }: { 
  isrs: OSISR[]; 
  resources: OSResource[];
  onUpdate: (isrs: OSISR[]) => void;
}) {
  const addISR = () => {
    const newISR: OSISR = {
      id: `isr-${Date.now()}`,
      name: `ISR_${isrs.length + 1}`,
      category: 2,
      priority: 50,
      vector: 'IRQn',
    }
    onUpdate([...isrs, newISR])
  }

  const updateISR = (index: number, updates: Partial<OSISR>) => {
    const newISRs = [...isrs]
    newISRs[index] = { ...newISRs[index], ...updates }
    onUpdate(newISRs)
  }

  const removeISR = (index: number) => {
    onUpdate(isrs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">ISRs ({isrs.length})</h3>
        <button
          onClick={addISR}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add ISR
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isrs.map((isr, index) => (
          <div key={isr.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={isr.name}
                onChange={(e) => updateISR(index, { name: e.target.value })}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                placeholder="ISR name"
              />
              <button
                onClick={() => removeISR(index)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Category</label>
                <select
                  value={isr.category}
                  onChange={(e) => updateISR(index, { category: parseInt(e.target.value) as 1 | 2 })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value={1}>Category 1</option>
                  <option value={2}>Category 2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Priority</label>
                <input
                  type="number"
                  min={1}
                  max={255}
                  value={isr.priority}
                  onChange={(e) => updateISR(index, { priority: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Vector</label>
                <input
                  type="text"
                  value={isr.vector}
                  onChange={(e) => updateISR(index, { vector: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="IRQn"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Resource (Optional)</label>
              <select
                value={isr.resource || ''}
                onChange={(e) => updateISR(index, { resource: e.target.value || undefined })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="">None</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
