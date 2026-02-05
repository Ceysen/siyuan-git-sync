import { Dialog, Plugin } from "siyuan";

export class GitConfigDialog {
    /**
     * 显示 Git 同步配置弹窗
     */
    static showGitConfigDialog(plugin: Plugin) {
        const dialog = new Dialog({
            title: "Git 同步配置",
            content: `<div class="b3-dialog__content" style="padding: 20px;">
                <div class="fn__flex-column">
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">GitHub 仓库地址</label>
                        <input type="text" id="repositoryUrl" class="b3-text-field" placeholder="https://github.com/username/repo.git" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">填写你想同步的 GitHub 仓库 HTTPS 地址</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">分支名称</label>
                        <input type="text" id="branch" class="b3-text-field" placeholder="main" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">默认分支用于 push 操作</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Personal Access Token</label>
                        <input type="password" id="authToken" class="b3-text-field" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">用于认证 GitHub 权限，必须有 push 权限</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">默认 Commit 信息模板</label>
                        <input type="text" id="commitTemplate" class="b3-text-field" placeholder="同步笔记更新：{{date}}" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">可使用 {{date}} 占位符自动生成提交信息</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Commit 作者名称</label>
                        <input type="text" id="authorName" class="b3-text-field" placeholder="Your Name" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Git commit 作者信息，可为空使用默认配置</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Commit 作者邮箱</label>
                        <input type="text" id="authorEmail" class="b3-text-field" placeholder="you@example.com" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Git commit 作者邮箱</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">自动同步间隔（分钟）</label>
                        <input type="number" id="syncInterval" class="b3-text-field" placeholder="0 表示手动同步" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">设置插件自动同步的间隔时间</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">白名单同步路径</label>
                        <input type="text" id="includePaths" class="b3-text-field" placeholder="blocks/, data/" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">只同步指定路径下的文件，支持多路径</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">黑名单排除路径</label>
                        <input type="text" id="excludePaths" class="b3-text-field" placeholder="cache/, logs/" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">排除不需要同步的文件或目录</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">强制覆盖远程分支</label>
                        <input type="checkbox" id="forcePush" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">启用后会忽略冲突直接 push（慎用）</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">模拟同步模式</label>
                        <input type="checkbox" id="dryRun" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">开启后仅显示将要同步的文件和 commit 信息，不实际 push</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-top: 24px; text-align: right;">
                        <button id="saveConfig" class="b3-btn b3-btn--primary" style="margin-right: 8px;">保存配置</button>
                        <button id="cancelConfig" class="b3-btn">取消</button>
                    </div>
                </div>
            </div>`,
            width: window.innerWidth < 900 ? "92vw" : "800px",
            height: window.innerHeight < 900 ? "80vh" : "700px"
        });
        
        // 加载已保存的配置
        setTimeout(() => {
            const savedConfig = plugin.data.gitSyncConfig;
            if (savedConfig && savedConfig.gitConf) {
                const gitConf = savedConfig.gitConf;
                if (gitConf.repositoryUrl) {
                    (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value = gitConf.repositoryUrl;
                }
                if (gitConf.branch) {
                    (dialog.element.querySelector('#branch') as HTMLInputElement).value = gitConf.branch;
                }
                if (gitConf.authToken) {
                    (dialog.element.querySelector('#authToken') as HTMLInputElement).value = gitConf.authToken;
                }
                if (gitConf.commitTemplate) {
                    (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value = gitConf.commitTemplate;
                }
                if (gitConf.authorName) {
                    (dialog.element.querySelector('#authorName') as HTMLInputElement).value = gitConf.authorName;
                }
                if (gitConf.authorEmail) {
                    (dialog.element.querySelector('#authorEmail') as HTMLInputElement).value = gitConf.authorEmail;
                }
                if (gitConf.syncInterval) {
                    (dialog.element.querySelector('#syncInterval') as HTMLInputElement).value = gitConf.syncInterval.toString();
                }
                if (gitConf.includePaths && gitConf.includePaths.length > 0) {
                    (dialog.element.querySelector('#includePaths') as HTMLInputElement).value = gitConf.includePaths.join(', ');
                }
                if (gitConf.excludePaths && gitConf.excludePaths.length > 0) {
                    (dialog.element.querySelector('#excludePaths') as HTMLInputElement).value = gitConf.excludePaths.join(', ');
                }
                if (gitConf.forcePush) {
                    (dialog.element.querySelector('#forcePush') as HTMLInputElement).checked = gitConf.forcePush;
                }
                if (gitConf.dryRun) {
                    (dialog.element.querySelector('#dryRun') as HTMLInputElement).checked = gitConf.dryRun;
                }
            }
        }, 100);
        
        // 添加保存按钮点击事件
        setTimeout(() => {
            const saveButton = dialog.element.querySelector('#saveConfig');
            if (saveButton) {
                saveButton.addEventListener('click', async () => {
                    const config = {
                        gitConf: {
                            repositoryUrl: (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value,
                            branch: (dialog.element.querySelector('#branch') as HTMLInputElement).value,
                            authToken: (dialog.element.querySelector('#authToken') as HTMLInputElement).value,
                            commitTemplate: (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value || "同步笔记更新：{{date}}",
                            authorName: (dialog.element.querySelector('#authorName') as HTMLInputElement).value,
                            authorEmail: (dialog.element.querySelector('#authorEmail') as HTMLInputElement).value,
                            syncInterval: parseInt((dialog.element.querySelector('#syncInterval') as HTMLInputElement).value) || 0,
                            includePaths: ((dialog.element.querySelector('#includePaths') as HTMLInputElement).value || "").split(',').map(item => item.trim()).filter(item => item !== ''),
                            excludePaths: ((dialog.element.querySelector('#excludePaths') as HTMLInputElement).value || "").split(',').map(item => item.trim()).filter(item => item !== ''),
                            forcePush: (dialog.element.querySelector('#forcePush') as HTMLInputElement).checked,
                            dryRun: (dialog.element.querySelector('#dryRun') as HTMLInputElement).checked
                        }
                    };
                    console.log('Git 同步配置:', config);
                    
                    // 保存配置到插件的数据对象
                    plugin.data.gitSyncConfig = config;
                    // 持久化保存数据
                    await plugin.saveData('gitSyncConfig', config);
                    
                    // 关闭弹窗
                    dialog.destroy();
                });
            }
            
            // 添加取消按钮点击事件
            const cancelButton = dialog.element.querySelector('#cancelConfig');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    dialog.destroy();
                });
            }
        }, 100);
    }
}
