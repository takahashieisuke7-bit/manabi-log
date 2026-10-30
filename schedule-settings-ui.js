/* Presentation only: reuse the original forms, listeners and saved values. */
(() => {
  const byId = id => document.getElementById(id);
  const dialog = byId('scheduleToolsDialog');
  const title = byId('scheduleToolsTitle');
  const back = byId('scheduleToolsBack');
  const status = byId('scheduleToolsStatus');
  const panels = [...dialog.querySelectorAll('[data-schedule-tool-panel]')];
  const titles = { materials: '教材・予定設定', create: '教材を追加', holiday: '休日の設定', rules: '復習・負担の設定', manual: '1件だけ予定を追加' };
  const manager = byId('materialProgressDetails');
  const sources = {
    create: document.querySelector('.schedule-create-card'),
    holiday: byId('holidayDetails').closest('.card'),
    rules: byId('scheduleSettingsForm').closest('.card'),
    manual: byId('manualScheduleForm').closest('.card'),
  };
  for (const [route, card] of Object.entries(sources)) {
    const panel = panels.find(node => node.dataset.scheduleToolPanel === route);
    card.classList.add('schedule-tool-source');
    const details = card.querySelector('details');
    details.open = true;
    panel.append(card);
  }
  manager.open = true;
  panels.find(node => node.dataset.scheduleToolPanel === 'materials').append(manager);
  // Keep the rescue counter visible when the old holiday section summary is hidden.
  panels.find(node => node.dataset.scheduleToolPanel === 'holiday').prepend(byId('rescueCount'));
  document.querySelector('.schedule-tools').hidden = true;
  let returnToMaterials = false;

  function copyStatus() {
    const source = byId('scheduleStatus');
    status.textContent = source.textContent;
    status.className = source.className;
  }
  function show(route) {
    if (!Object.hasOwn(titles, route)) return;
    for (const panel of panels) panel.hidden = panel.dataset.scheduleToolPanel !== route;
    title.textContent = titles[route];
    back.hidden = route === 'materials';
    status.textContent = '';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    title.focus();
  }
  document.addEventListener('manabi:schedule-tool', event => show(event.detail));
  dialog.querySelectorAll('[data-open-schedule-tool]').forEach(button => {
    button.addEventListener('click', () => show(button.dataset.openScheduleTool));
  });
  back.addEventListener('click', () => show('materials'));
  byId('scheduleToolsClose').addEventListener('click', () => dialog.close());

  // Open the existing editor without stacking the settings directory underneath it.
  byId('materialProgressList').addEventListener('click', event => {
    if (!event.target.closest('button[data-material-settings]')) return;
    returnToMaterials = true;
    dialog.close();
  }, true);
  function restoreDirectory() {
    queueMicrotask(() => {
      if (!returnToMaterials || byId('materialSettingsDialog').open || byId('scheduleChangeDialog').open) return;
      returnToMaterials = false;
      show('materials');
      copyStatus();
    });
  }
  byId('materialSettingsDialog').addEventListener('close', restoreDirectory);
  byId('scheduleChangeDialog').addEventListener('close', restoreDirectory);

  const archiveDialog=byId('materialArchiveDialog');
  let pendingArchive=null;
  byId('materialProgressList').addEventListener('click', event=>{
    const button=event.target.closest('button[data-material-archive]');
    if(!button)return;
    pendingArchive={planId:button.dataset.materialArchive,material:button.dataset.materialName};
    const tasks=materialArchiveTasks(pendingArchive.planId,pendingArchive.material);
    const pending=tasks.filter(task=>!task.done),fixed=pending.filter(task=>task.fixed).length;
    byId('materialArchiveName').textContent=pendingArchive.material;
    byId('materialArchiveImpact').textContent=`未完了の予定${pending.length}件${fixed?`（固定${fixed}件を含む）`:''}を予定から外します。`;
    byId('materialArchiveStatus').textContent='';
    dialog.close();archiveDialog.showModal();
  });
  for(const id of ['materialArchiveClose','materialArchiveCancel'])byId(id).addEventListener('click',()=>archiveDialog.close());
  archiveDialog.addEventListener('close',()=>{pendingArchive=null;show('materials');copyStatus();});
  byId('materialArchiveSave').addEventListener('click',()=>{
    if(!pendingArchive)return;
    try{
      const entry=archiveMaterial(pendingArchive.planId,pendingArchive.material);
      setScheduleStatus(`${entry.material}を削除済みの一覧に移しました。学習記録・完了実績は残っています。`,'success');
      render();archiveDialog.close();
    }catch(error){byId('materialArchiveStatus').textContent=error.message;}
  });
  byId('archivedMaterialList').addEventListener('click',event=>{
    const button=event.target.closest('button[data-material-restore]');
    if(!button)return;
    try{
      const entry=restoreMaterial(button.dataset.materialRestore);
      setScheduleStatus(`${entry.material}を戻しました。保存されている日付・範囲で予定を再表示します。必要なら予定を組み直せます。`,'success');
      render();copyStatus();
    }catch(error){setScheduleStatus(error.message,'error');copyStatus();}
  });
  document.defaultView?.addEventListener('storage',event=>{
    if(event.key!==ARCHIVED_MATERIALS_KEY)return;
    archivedMaterials=loadArchivedMaterials();lastReschedule=loadLastReschedule();render();
  });

  for (const id of ['materialPlanForm', 'manualScheduleForm', 'holidayForm', 'scheduleSettingsForm']) {
    byId(id).addEventListener('submit', () => {
      if (id === 'materialPlanForm' && byId('scheduleStatus').classList.contains('success')) show('materials');
      copyStatus();
    });
  }
  function syncReview() {
    const enabled = byId('materialReviewEnabled').checked;
    byId('materialReviewDetails').hidden = !enabled;
    byId('materialReviewSummary').textContent = byId('materialReviewOffsets').value.replace(/[,、\s]+/g, '・') + '日後';
  }
  byId('materialPlanForm').addEventListener('input', syncReview);
  byId('materialPlanForm').addEventListener('change', syncReview);
  document.querySelectorAll('[data-weekday-preset]').forEach(button => {
    button.addEventListener('click', () => {
      const inputs = [...button.closest('.weekday-picker').querySelectorAll('input[type="checkbox"]')];
      for (const input of inputs) input.checked = button.dataset.weekdayPreset === 'all' || ['1', '2', '3', '4', '5'].includes(input.value);
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  document.addEventListener('manabi:render', () => {
    syncReview();
    if (dialog.open) copyStatus();
  });
  // schedule-ui applies the user's creation defaults in its DOMContentLoaded handler.
  document.addEventListener('DOMContentLoaded', syncReview);
  syncReview();
})();
